# CodeTrack frontend

CodeTrack is a responsive React dashboard for mentors tracking student coding performance. It runs in mock mode without a backend and keeps REST communication in service modules, ready for a FastAPI integration.

## Run locally

1. Install Node.js 18 or later.
2. Copy `.env.example` to `.env`.
3. Run `npm install`.
4. Run `npm run dev` and open the Vite URL shown in the terminal.

The demo login accepts any valid email and password. The sign-in state is a frontend-only demo; it is not real authentication.

## Backend Integration

### Configuration

The REST API base URL is configured in `.env` as `VITE_API_BASE_URL`. The example value is `http://localhost:8000/api/v1`. The Axios instance in `src/services/api.ts` reads this variable; API URLs are not embedded in UI components.

Mock data is enabled by default with `VITE_USE_MOCK_DATA=true`. To use the backend, set `VITE_USE_MOCK_DATA=false` in `.env` and restart Vite. Components continue calling the same service functions in either mode.

### Where to connect the API

- `src/services/api.ts`: shared Axios instance, base URL, timeout, and friendly transport error mapping.
- `src/services/studentApi.ts`: student list, student detail, and statistics calls.
- `src/services/dashboardApi.ts`: dashboard totals, performance data, platform totals, and top students.
- `src/services/importApi.ts`: file upload, import status, preview, mapping, validation, commit, error export, and Google Sheets operations.
- `src/services/reportApi.ts`: report generation and report download.
- `src/types/`: frontend response/request contracts. Update these contracts and the corresponding service adapters if backend response shapes differ; page components should not need API-specific changes.
- `src/mock/`: demo fixtures used when mock mode is enabled.

### Endpoint and response expectations

The service functions currently expect these JSON contracts (unless the response is a file/blob):

| Frontend function | Request | Expected response |
|---|---|---|
| `getStudents({ page, page_size, search })` | `GET /students` query parameters | `{ items: Student[], page: number, page_size: number, total: number }` |
| `getStudent(id)` | `GET /students/{id}` | One `Student` object |
| `getStudentStatistics(id)` | `GET /students/{id}/stats` | Student statistics object (currently represented by `Student`) |
| `getDashboardStatistics()` | `GET /dashboard` | `{ total_students, active_students, problems_solved, average_rating }` |
| `getPerformanceData()` | `GET /dashboard/performance` | `PerformancePoint[]`, each with `month`, `solved`, `rating` |
| `getPlatformData()` | `GET /dashboard/platforms` | `PlatformPoint[]`, each with `name`, `solved`, `color` |
| `getTopStudents()` | `GET /rankings?limit=5` | `Student[]` |
| `uploadImportFile(file, classId)` | `POST /imports/files` multipart fields `file`, `class_id` | `{ import_id: string }` |
| `getImportStatus(importId)` | `GET /imports/{importId}` | `{ import_id: string, status: string }` |
| `getImportPreview(importId, page, pageSize)` | `GET /imports/{importId}/preview` query `page`, `page_size` | `ImportPreview`: `{ import_id, status, summary, rows }`; row values follow `src/types/import.ts` |
| `saveColumnMapping(importId, mapping)` | `PATCH /imports/{importId}/mapping` JSON `{ mapping: Record<string,string> }` | Any successful 2xx response |
| `validateImport(importId)` | `POST /imports/{importId}/validate` | `ImportPreview` with updated validation summary and rows |
| `commitImport(importId, options)` | `POST /imports/{importId}/commit` JSON `{ existing: "update" \| "skip", skip_invalid: boolean }` | `{ created, updated, skipped, failed }` |
| `getImportErrors(importId)` | `GET /imports/{importId}/errors` | CSV or other file response (`Blob`) |
| `connectGoogleSheet(payload)` | `POST /imports/google-sheets` JSON `{ spreadsheet_id, sheet_name, class_id }` | `{ import_id: string }` |
| `getGoogleSpreadsheets()` | `GET /imports/google-sheets/spreadsheets` | Array of `{ id, name, updated_at }` |
| `getGoogleSheets(spreadsheetId)` | `GET /imports/google-sheets/{spreadsheetId}/sheets` | Array of `{ title, row_count }` |
| `generateReport(request)` | `POST /reports` JSON `{ type, student_id?, format }` | `{ report_id: string }` |
| `downloadReport(reportId)` | `GET /reports/{reportId}/download` | File response (`Blob`) |

Student rows use `Student` in `src/types/student.ts`. Import rows use snake_case fields, a status of `valid`, `warning`, `invalid`, or `duplicate`, and an `issues` array with `field`, `code`, and readable `message`. All REST requests go through Axios in the service layer. Adapt the service functions there if the backend chooses different paths, pagination envelopes, or field names.

### Notes

- Import upload checks the extension and 10 MB size limit in the browser; server-side parsing and validation remain backend responsibilities.
- Google Sheets is frontend UI only. OAuth, account authorization, and token storage are intentionally not implemented here.
- Reports are requested from the API. The browser only downloads the returned file; it does not render PDF reports.
- This frontend includes no database, SQLAlchemy, PostgreSQL, FastAPI, or real authentication code.
