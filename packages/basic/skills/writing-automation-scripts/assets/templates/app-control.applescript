-- Purpose: macOS app control template.
-- Use this for opening apps, focusing windows, opening URLs, or simple desktop actions.
-- Keep comments for every non-obvious step so the script stays maintainable.

-- Example: open Safari and visit a URL.
tell application "Safari"
    activate
    if (count of windows) = 0 then
        make new document
    end if
    set URL of front document to "http://localhost:3000"
end tell

-- Extend below for Finder, System Events, or other apps.
-- Keep explaining why each step exists, not just what it does.
