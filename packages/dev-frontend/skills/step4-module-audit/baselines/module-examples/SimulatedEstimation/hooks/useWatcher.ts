import { useEffect } from 'react';
import { WatcherParams } from '../defs/type';

/**
 * 监听事件 hook
 */
export default ({ data: _, controllers: $, form }: WatcherParams) => {
  useEffect(() => {
    $.updateSimulatePlans();
  }, [_.formValues.accountId]);

  /**
   * 单选框增加取消选中逻辑
   */
  useEffect(() => {
    // 可能存在多个组：逐个容器绑定（事件委托到容器内部）
    const containerSelectors = ['.se-strategy-radio', '#strategy'];
    const containers = containerSelectors.reduce<HTMLElement[]>((acc, sel) => {
      document.querySelectorAll(sel).forEach((node) => {
        if (node instanceof HTMLElement && !acc.includes(node)) {
          acc.push(node);
        }
      });
      return acc;
    }, []);
    if (containers.length === 0) return;

    // 记录按下时的值，避免 React onChange 提前更新导致误清空
    let downValue: string | undefined = undefined;

    const getEventElement = (target: EventTarget | null): Element | null => {
      if (!target) return null;
      if (target instanceof Element) return target;
      return (target as Node).parentElement;
    };

    const getClickedValue = (el: EventTarget | null): string | undefined => {
      const element = getEventElement(el);
      if (!element) return undefined;

      const wrapper = element.closest(
        '.m9-radio-wrapper, .m9-radio-button-wrapper',
      ) as HTMLElement | null;
      if (!wrapper) return undefined;

      const input = wrapper.querySelector(
        'input[type="radio"]',
      ) as HTMLInputElement | null;
      if (!input || input.disabled) return undefined;

      return input.value; // 原生始终为 string
    };

    const getCurrentValue = (): string | undefined => {
      if (typeof form?.getFieldValue === 'function') {
        return form.getFieldValue('strategy');
      }
      return _.formValues.strategy;
    };

    const onMouseDownCapture = (e: Event) => {
      downValue = getClickedValue(e.target) ?? undefined;
    };

    const onClick = (e: Event) => {
      const clicked = getClickedValue(e.target);
      if (!clicked) return;

      if (
        downValue !== undefined &&
        String(downValue) === String(getCurrentValue())
      ) {
        // 用 rAF 确保在 React onChange 之后执行，最终以清空为准
        requestAnimationFrame(() => {
          _.setScopeState((draft) => {
            draft.formValues.strategy = '';
            return draft;
          });
          form.setFieldValue('strategy', '');
        });
      }
    };

    containers.forEach((el) => {
      el.addEventListener('mousedown', onMouseDownCapture, true);
      el.addEventListener('click', onClick, false);
    });

    return () => {
      containers.forEach((el) => {
        el.removeEventListener('mousedown', onMouseDownCapture, true);
        el.removeEventListener('click', onClick, false);
      });
    };
  }, []);
};
