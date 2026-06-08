# AGENTS.md

## Bối cảnh dự án (Project Context)

Kho lưu trữ này là một trang web / portfolio cá nhân đang được mở rộng với trang Luyện tập phỏng vấn (Interview Practice) công khai.

Mục tiêu hiện tại:
- Thêm tuyến đường `/interview` làm trang công khai bên cạnh `/blog`.
- Xây dựng nó dưới dạng một công cụ học tập có cấu trúc cá nhân: ngân hàng câu hỏi, bộ lọc, câu trả lời dạng accordion, flashcard, tiến độ/dấu trang lưu cục bộ.
- Giữ nguyên nhận diện trực quan công khai hiện tại: nhỏ gọn, tập trung vào nhà phát triển, token trung tính, thẻ bo góc, đường viền tinh tế, chuyển động nhẹ nhàng.
- Không biến sản phẩm này thành SaaS, nền tảng học tập trả phí, chợ ứng dụng (marketplace), bảng điều khiển nhiều người dùng (multi-user dashboard) hoặc sản phẩm luyện thi thương mại.

Trang Luyện tập phỏng vấn sẽ ở dạng công khai trong phiên bản MVP, nhưng cấu trúc mã nguồn nên giữ một lộ trình rõ ràng để chuyển sang chế độ riêng tư/chỉ dành cho chủ sở hữu trong tương lai.

## Vấn đề cốt lõi cần giải quyết (Core Problem To Solve)

Khi triển khai giao diện (UI), không sử dụng các thư viện UI chỉ ở mức độ cơ bản.

Mẫu thiết kế xấu (Bad pattern):
- Chỉ sử dụng `Card`, `Button`, `Input` hoặc thẻ `div` thô.
- Không kiểm tra các thành phần/khối (components/blocks) có sẵn của shadcn.
- Không kiểm tra các tùy chọn Magic UI / Alternative UI / Aceternity-style để tăng độ bóng bẩy trực quan cho trang công khai.
- Không kiểm tra giao diện dự án hiện có trước khi viết mã.
- Không so sánh các tùy chọn bố cục/thành phần.
- Không xem xét các trạng thái tải (loading), trống (empty), lỗi (error), thiết kế phản hồi (responsive), khả năng truy cập (accessibility), đa ngôn ngữ (i18n) và các ranh giới xác thực/dữ liệu tương lai.

Mẫu thiết kế mong đợi (Expected pattern):
- Phân tích giao diện đích trước.
- Truy vấn các thư viện/công cụ có sẵn khi thấy hữu ích.
- So sánh một vài tùy chọn giao diện hợp lý.
- Chọn sự kết hợp tốt nhất cho dự án này.
- Chỉ triển khai sau khi đã lựa chọn rõ ràng.

## Các kỹ năng / Công cụ có sẵn (Available Skills / Tools)

Sử dụng các kỹ năng này khi có liên quan:
- `$frontend-design`
- `$frontend-patterns`
- `$shadcn`
- `$shadcn-component-review`
- `@Browser`
- `$browser:control-in-app-browser`

Sử dụng MCP/công cụ khi hữu ích:
- `context7`
- `shadcn`
- `magicuidesign`
- `node_repl`

Khi không chắc chắn về một thành phần, khối, API, mẫu thiết kế hoặc cách sử dụng thư viện, hãy truy vấn MCP/context7 thay vì đoán.

## Quy trình quyết định UI (UI Decision Workflow)

Trước khi triển khai bất kỳ tác vụ UI quan trọng nào, hãy tạo một kế hoạch ngắn gọn với:
1. Giao diện đích (Target surface)
2. Mẫu thiết kế đích (Target pattern)
3. Các tuyến đường/tệp tin bị ảnh hưởng (Affected route/files)
4. Các thành phần/khối/thư viện ứng viên (Candidate components/blocks/libraries)
5. Thành phần kết hợp được chọn và lý do (Chosen composition and reason)
6. Ranh giới dữ liệu/máy chủ/máy khách (Data/server/client boundary)
7. Lưu ý về khả năng truy cập/responsive (Accessibility/responsive notes)
8. Kế hoạch xác minh (Verification plan)

Giữ kế hoạch ngắn gọn. Không thiết kế quá mức cần thiết (over-engineer).

Đối với giao diện trực quan nặng hoặc hướng ngoại công khai, hãy so sánh ít nhất các tùy chọn sau khi khả thi:

| Tùy chọn (Option) | Nguồn (Source) | Thành phần kết hợp (Composition) | Ưu điểm (Pros) | Nhược điểm (Cons) | Quyết định (Decision) |
|---|---|---|---|---|---|
| An toàn (Conservative) | Dự án hiện tại + shadcn | ... | ... | ... | ... |
| Bóng bẩy (Polished) | shadcn + Magic UI / Alternative UI | ... | ... | ... | ... |
| Thử nghiệm nhưng an toàn (Experimental but safe) | Lấy cảm hứng từ Alternative UI / Aceternity-style | ... | ... | ... | ... |

Nếu có ít tùy chọn hơn phù hợp, hãy giải thích ngắn gọn lý do.

## Chính sách thư viện UI (UI Library Policy)

Sử dụng các thư viện theo đúng trách nhiệm.

### Các thành phần hiện có của dự án (Existing project components)

Ưu tiên các thành phần và mẫu thiết kế trực quan hiện có của dự án trước.

Kiểm tra kỹ trước khi tạo UI mới:
- `src/components`
- `src/components/ui`
- `src/components/magicui`
- `src/data/resume.tsx`
- Mẫu dock/navbar hiện tại.
- Mẫu tuyến đường blog hiện tại.
- Ràng buộc bố cục hiện tại.

Không thiết kế lại nhận diện trực quan công khai trừ khi được yêu cầu rõ ràng.

### shadcn/ui

Sử dụng shadcn/ui làm nền tảng tương tác/thành phần chính.

Ưu tiên dùng cho:
- Accordion (đóng mở nội dung)
- Card (thẻ)
- Badge (huy hiệu)
- Button (nút nhấn)
- Tooltip (chú giải công cụ)
- Separator (đường phân cách)
- Các bộ lọc dạng tabs/chips/select
- Dialog/sheet (hộp thoại/trang trượt) nếu cần
- Các thành phần tương tác dễ tiếp cận (accessible interaction primitives)

Đối với trang `/interview`, shadcn đặc biệt phù hợp cho:
- Accordion câu hỏi
- Huy hiệu cấp độ
- Các bộ điều khiển lọc
- Trạng thái trống (empty states)
- Các nút hành động
- Hành động tooltip
- Khung thẻ flashcard

### Magic UI

Chỉ sử dụng Magic UI để đánh bóng trực quan công khai.

Trường hợp sử dụng tốt:
- Subtle reveal (hiệu ứng xuất hiện tinh tế)
- Đánh bóng tiêu đề trang (page header)
- Hoạt ảnh nhẹ cho phần giao diện
- Bảo tồn nhận diện hoạt ảnh hiện tại

Tránh:
- Hoạt ảnh quá nặng
- Che giấu các thay đổi trạng thái
- Làm cho công cụ học tập có cảm giác giống như một trang đích SaaS hào nhoáng

### Alternative UI

Xem Alternative UI như một nguồn/thư viện UI khác bên cạnh Magic UI.

Sử dụng cho:
- Các thành phần trực quan công khai
- Ý tưởng bố cục (layout)
- Biến thể thẻ/bento (bento/card variations)
- Đánh bóng tiêu đề/hero
- Ý tưởng trạng thái trống (empty state)
- Nguồn cảm hứng cho thẻ/phần giao diện của hệ thống

Quy tắc:
- Không sao chép mù quáng.
- Điều chỉnh cho phù hợp với các Tailwind tokens và nhận diện trực quan của dự án.
- Tránh thêm các phụ thuộc không cần thiết.
- Kiểm tra khả năng truy cập (accessibility) và hành vi phản hồi (responsive).
- Không sử dụng nó để thay thế shadcn cho các tương tác cốt lõi.

### Aceternity-style UI

Chỉ sử dụng làm nguồn cảm hứng cho các biến thể trực quan mang tính biên tập/công khai.

Không sử dụng cho:
- Các bộ lọc cốt lõi
- Hành vi accordion
- Trạng thái dữ liệu
- Các hành động hủy hoại (destructive actions)
- Luồng xác thực/riêng tư trong tương lai

### Hoạt ảnh (Motion)

Sử dụng hoạt ảnh một cách nhẹ nhàng.

Được phép:
- Subtle page/header reveal (hiệu ứng xuất hiện trang/tiêu đề nhẹ nhàng)
- Lật thẻ flashcard nếu đảm bảo khả năng truy cập
- Các chuyển cảnh nhẹ nhàng (gentle transitions)

Tránh:
- Hoạt ảnh gây mất tập trung khi đọc câu hỏi/câu trả lời
- Hoạt ảnh che giấu trạng thái UI
- Hiệu ứng hover quá mức

## Icon / Logo Rules

Khi UI có category công nghệ, framework, tool hoặc metadata, nên dùng icon/logo để tăng khả năng nhận diện, nhưng phải nhất quán và không gây rối.

Ưu tiên theo thứ tự:

1. Icon/logo/component đã có trong project.
2. Icon đã dùng trong `src/data/resume.tsx`, navbar, skill/project sections.
3. Icon library đã cài sẵn trong project.
4. `lucide-react` hoặc icon shadcn-compatible cho action chung.
5. Tech logo riêng chỉ khi thật sự cần và có source phù hợp.
6. Fallback text/generic icon nếu không có logo tốt.

Với data-driven UI, không lưu JSX/SVG trực tiếp trong data. Dùng key ổn định rồi resolve qua registry:

```tsx
<TechIcon name={category.iconKey ?? "default"} />
````

Nên dùng icon/logo cho:

* category nav
* filter chips
* badges
* flashcard metadata
* empty states
* search/copy/share/bookmark/learned actions

Trước khi thêm icon source/dependency mới, phải kiểm tra project hiện có và query MCP/context7 nếu chưa chắc. Chỉ thêm dependency khi có lý do rõ ràng.

Không được:

* import icon lung tung trong nhiều file
* hardcode logo URL ngoài
* dùng icon-only button thiếu `aria-label`
* dùng logo màu mè gây nhiễu trong list dày
* copy icon/logo demo từ Magic UI / Alternative UI / Aceternity mà chưa adapt vào project style

## Quy tắc triển khai Luyện tập phỏng vấn (Interview Practice Implementation Rules)

Tuân thủ thông số thiết kế cho trang `/interview`.

### Tuyến đường (Route)

Thêm:
```txt
src/app/interview/page.tsx
```

Thêm mục điều hướng `Interview` bên cạnh `Blog`.

### Ranh giới tính năng (Feature boundary)

Ưu tiên sử dụng một thư mục tính năng:
```txt
src/features/interview-practice/
  components/
  data/
  lib/
  types.ts
```

Các tệp được đề xuất:
```txt
src/features/interview-practice/data/questions.json
src/features/interview-practice/lib/question-schema.ts
src/features/interview-practice/lib/question-repository.ts
src/features/interview-practice/lib/question-filters.ts
src/features/interview-practice/lib/question-url-state.ts
src/features/interview-practice/components/interview-practice-page.tsx
src/features/interview-practice/components/category-nav.tsx
src/features/interview-practice/components/question-filters.tsx
src/features/interview-practice/components/question-list.tsx
src/features/interview-practice/components/question-card.tsx
src/features/interview-practice/components/flashcard-deck.tsx
src/features/interview-practice/components/local-learning-state.tsx
```

Nếu việc di chuyển tệp `data.json` gây ra quá nhiều xáo trộn, hãy đọc nó từ vị trí hiện tại trước, nhưng giữ việc truy cập dữ liệu đằng sau một module kho lưu trữ tính năng (feature repository module).

### Ranh giới dữ liệu (Data boundary)

Không import trực tiếp tệp JSON câu hỏi thô vào các Client Components.

Phía Server nên:
- Đọc/xác thực dữ liệu câu hỏi.
- Tính toán số lượng danh mục (category counts).
- Tính toán số lượng danh mục con (subcategory counts).
- Áp dụng các bộ lọc từ `searchParams`.
- Ánh xạ các trường ngôn ngữ vào các DTO hiển thị (view DTOs).
- Chỉ truyền các DTO cần thiết cho các Client Components.

Sử dụng `import "server-only"` trong module kho dữ liệu khi thích hợp.

Phía Client chỉ nên xử lý:
- Tương tác accordion nếu cần.
- Lật/tiếp theo/quay lại đối với flashcard.
- Trạng thái đã học/đánh dấu cục bộ bằng `localStorage`.
- Hành động sao chép câu hỏi hoặc chia sẻ URL.

### Mô hình dữ liệu (Data model)

Cấu trúc câu hỏi thô (Raw question shape):
```ts
type InterviewQuestionRaw = {
  id: number;
  category: string;
  subcategory: string;
  level: "beginner" | "intermediate" | "advanced";
  q: string;
  a: string;
  q_en: string;
  a_en: string;
};
```

Cấu trúc câu hỏi hiển thị (View shape):
```ts
type InterviewQuestionView = {
  id: number;
  category: string;
  subcategory: string;
  level: "beginner" | "intermediate" | "advanced";
  question: string;
  answer: string;
};
```

Ánh xạ ngôn ngữ (Locale mapping):
- `vi`: `q`, `a`
- `en`: `q_en`, `a_en`

Không tự động chuyển đổi từ Tiếng Anh sang Tiếng Việt (no fallback).

### Phạm vi MVP (MVP Scope)

Phải triển khai:
- Tuyến đường `/interview`.
- Mục điều hướng bên cạnh Blog.
- Xác thực dữ liệu.
- Tiêu đề trang hiển thị tổng số lượng.
- Điều hướng danh mục kèm theo số lượng.
- Bộ lọc danh mục con/chủ đề kèm theo số lượng.
- Bộ lọc cấp độ: tất cả (all), cơ bản (beginner), trung bình (intermediate), nâng cao (advanced).
- Tìm kiếm trong phạm vi cụ thể (scoped search).
- Danh sách câu hỏi dạng accordion.
- Hiển thị câu trả lời dạng markdown với code nội dòng/khối mã đơn giản.
- Huy hiệu cấp độ (level badges).
- Chỉ mục/ID câu hỏi.
- Chế độ flashcard cho tập hợp câu hỏi hiện đã được lọc.
- Trạng thái đã học/đánh dấu cục bộ sử dụng `localStorage`.
- Hành động sao chép câu hỏi hoặc chia sẻ URL.
- Giao diện phản hồi (responsive) và có thể truy cập bằng bàn phím.

Nên triển khai nếu khối lượng nhỏ:
- Trạng thái trống (empty states).
- Trạng thái URL cho bộ lọc/tìm kiếm/chế độ/ngôn ngữ.
- Số lượng câu hỏi sau khi lọc.
- Tóm tắt tiến độ cục bộ.

Trì hoãn (Defer):
- Đăng nhập.
- Trả phí/cổng thanh toán (paywall).
- Tài khoản người dùng.
- Quản trị CRUD.
- Cơ sở dữ liệu.
- Bảng lệnh toàn cục (global command palette).
- Tuyến đường chi tiết câu hỏi chuyên dụng.
- Tiến độ/dấu trang phía máy chủ.
- Dịch thuật bằng AI.
- Bảng phân tích dữ liệu (analytics dashboard).

### Trạng thái URL (URL State)

Ưu tiên trạng thái URL hơn trạng thái ứng dụng bị ẩn.

Ví dụ:
```txt
/interview?category=Next.js&subcategory=Rendering&level=intermediate&q=cache&mode=list&lang=vi
/interview?category=React&mode=flashcards&lang=en
```

Mặc định:
- category: `Next.js`
- language: `vi`
- mode: `list`
- level: `all`
- accordion: single-open (chỉ mở một mục tại một thời điểm)

### Hướng bố cục (Layout Direction)

Bố cục gốc hiện tại có thể hơi hẹp. Hãy giữ nguyên nhận diện của trang web, nhưng cho phép trang `/interview` sử dụng khung bên trong rộng hơn khi cần thiết.

Hướng ưu tiên:
- Tiêu đề nhỏ gọn.
- Máy tính để bàn: điều hướng danh mục + nội dung chính.
- Thiết bị di động: các chip danh mục nằm ngang hoặc bộ chọn dạng menu (select).
- Danh sách câu hỏi dạng cột đơn.
- Các điều khiển flashcard rõ ràng và thân thiện với thao tác chạm.

Không viết lại bố cục toàn cục (global layout) trừ khi cần thiết.

### Khớp thành phần được đề xuất cho `/interview` (Recommended Component Mapping)

Sử dụng bảng này làm điểm bắt đầu, không phải là ràng buộc cứng:

| Khu vực UI | Mẫu thiết kế | Nguồn ưu tiên |
| ---------- | ------------ | ------------- |
| Tiêu đề trang | Tiêu đề công cụ công khai | Dự án hiện tại + Magic UI hiệu ứng nhẹ |
| Mục điều hướng | Điều hướng thanh dock | Thanh điều hướng hiện tại / `DATA.navbar` |
| Điều hướng danh mục | Thanh bên/dạng chips | Tự phát triển + phong cách shadcn |
| Lọc danh mục con | Chips/tabs chủ đề | Tự phát triển + phong cách shadcn |
| Bộ lọc cấp độ | Bộ lọc phân đoạn | Nút nhấn shadcn / Select nếu có sẵn |
| Tìm kiếm | Tìm kiếm phạm vi | Ô nhập liệu tự phát triển; shadcn Command sau này |
| Danh sách câu hỏi | Accordion | shadcn Accordion |
| Nội dung câu trả lời | Markdown | Trình kết xuất markdown an toàn |
| Flashcard | Bộ thẻ nhớ | Thẻ shadcn + Nút bấm + hiệu ứng chuyển động nhẹ |
| Tiến độ/Đánh dấu | Trạng thái học tập cục bộ | Nút bấm + Tooltip + hook cục bộ |
| Trạng thái trống | Phản hồi nhỏ gọn | Thẻ shadcn + văn bản bị mờ |

### Quy tắc khả năng truy cập / Responsive (Accessibility / Responsive Rules)

- Bộ lọc phải có khả năng tiếp cận được bằng bàn phím.
- Các trình kích hoạt accordion phải là các nút thực sự (real buttons).
- Thao tác lật flashcard phải sử dụng nút bấm, không chỉ dựa vào việc nhấp vào thẻ.
- Các nút đánh dấu/đã học cần có nhãn mô tả dễ tiếp cận (accessible labels).
- Huy hiệu cấp độ phải bao gồm văn bản chữ, không chỉ dùng màu sắc.
- Ô tìm kiếm phải có nhãn hiển thị hoặc thuộc tính `aria-label`.
- Các đoạn văn bản dài phải xuống dòng an toàn (wrap safely).
- Mục tiêu chạm trên thiết bị di động phải thoải mái.
- Hoạt ảnh không được che giấu các thay đổi trạng thái giao diện.

### Bảo mật / Tính riêng tư tương lai (Security / Future Privacy)

Phiên bản MVP là công khai.

Tuy nhiên:
- Không đặt tệp `data.json` thô dưới thư mục `public/`.
- Không gửi toàn bộ dữ liệu JSON thô cho Client Components.
- Giữ quyền truy cập dữ liệu/kho lưu trữ ở phía Server khi thực tế.
- Giữ giao diện người dùng tách biệt khỏi nguồn dữ liệu thô.
- Chuẩn bị sẵn lộ trình cho việc bảo vệ các tuyến đường chỉ dành cho chủ sở hữu trong tương lai mà không cần viết lại giao diện.

Hệ thống xác thực tương lai chỉ dành cho chủ sở hữu, không phải là một hệ thống người dùng chung.

## Xác minh (Verification)

Chạy khi có sẵn:
```bash
pnpm lint
pnpm build
```

Không tuyên bố các câu lệnh này vượt qua thành công trừ khi đã thực sự chạy chúng.

Kiểm tra thủ công:
- Trang `/interview` tải thành công.
- Mục điều hướng xuất hiện.
- Bộ lọc danh mục hoạt động tốt.
- Số lượng danh mục con hiển thị đúng.
- Bộ lọc cấp độ hoạt động tốt.
- Tìm kiếm hoạt động bằng cả tiếng Việt và tiếng Anh.
- Accordion kết xuất câu trả lời và mã nguồn đúng.
- Chế độ flashcard hoạt động tốt.
- Trạng thái đã học/đánh dấu vẫn được lưu sau khi tải lại trang.
- Bố cục di động khả dụng.
- Dữ liệu JSON thô không bị import vào Client Components.
- Không có tệp dữ liệu thô nào nằm dưới thư mục `public/`.

## Báo cáo hoàn thành (Completion Response)

Khi hoàn tất, hãy báo cáo:
1. Các tệp đã thay đổi.
2. Các quyết định/chọn lựa thành phần UI.
3. Các câu lệnh truy vấn MCP/context7/shadcn/Magic UI/Alternative UI đã dùng (nếu có).
4. Các nội dung được chủ động trì hoãn.
5. Các câu lệnh xác minh đã chạy và kết quả thực tế.

Giữ báo cáo cuối cùng ngắn gọn và súc tích.
