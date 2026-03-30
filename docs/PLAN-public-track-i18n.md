# PLAN - Public Tracking Multi-language Support (i18n)

This plan details the implementation of Vietnamese and English language support specifically for the Public Vessel Tracking feature.

## User Review Required

> [!NOTE]
> **Focused Scope**: Unlike the previous global plan, this implementation will ONLY affect the `/track` and `/track/[id]` pages. The Admin dashboard and other internal pages will remain in their current language (Vietnamese) for now.

> [!IMPORTANT]
> **URL Strategy**: To avoid breaking existing bookmarks or QR codes, I will implement a strategy that allows the current URLs to work as Vietnamese by default, while allowing `/en/track/...` for English.

## Proposed Changes

### [Phase 1: Foundation]

#### [NEW] [messages/vi.json](file:///g:/Source-code/port-management-new/apps/web/messages/vi.json)
- Translation keys for "Mã tàu", "Số điện thoại", "Tra cứu", "Trạng thái", etc.

#### [NEW] [messages/en.json](file:///g:/Source-code/port-management-new/apps/web/messages/en.json)
- English counterparts for all keys.

#### [NEW] [src/i18n.ts](file:///g:/Source-code/port-management-new/apps/web/src/i18n.ts)
- `next-intl` configuration limited to the public routes if possible, or application-wide but only utilized in public pages.

### [Phase 2: Routing Setup]

#### [MOVE] [app/(public)/track](file:///g:/Source-code/port-management-new/apps/web/src/app/%28public%29/track) → [app/[locale]/(public)/track](file:///g:/Source-code/port-management-new/apps/web/src/app/[locale]/%28public%29/track)
- Note: We will wrap only the public routes or use a middleware that handles the locale for these specific paths.

### [Phase 3: UI Implementation]

#### [MODIFY] [track/[id]/page.tsx](file:///g:/Source-code/port-management-new/apps/web/src/app/%28public%29/track/%5Bid%5D/page.tsx)
- Replace hardcoded strings with `t('key')` from `useTranslations`.

#### [NEW] [PublicLanguageSwitcher.tsx](file:///g:/Source-code/port-management-new/apps/web/src/components/PublicLanguageSwitcher.tsx)
- A small, clean toggle (VI | EN) to be placed in the tracking page header.

## Verification Plan

### Automated Tests
- None.

### Manual Verification
1.  **Direct Access**: Use a QR code link (current format) and verify it still loads in Vietnamese.
2.  **Switching**: Click "EN" and verify labels like "Vessel Name", "Progress", and "Logs" change to English.
3.  **Search**: Verify the search form on `/track` is also localized.
