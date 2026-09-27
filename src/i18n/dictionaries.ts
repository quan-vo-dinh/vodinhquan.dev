import type { Locale } from "./locale";

type DeepStringShape<T> = {
  [Key in keyof T]: T[Key] extends string
  ? string
  : T[Key] extends object
  ? DeepStringShape<T[Key]>
  : never;
};

const vi = {
  common: {
    home: "Trang chủ",
    blog: "Bài viết",
    moments: "Khoảnh khắc",
    studio: "Studio",
    linkedin: "LinkedIn",
    switchToEnglish: "Chuyển sang tiếng Anh",
    switchToVietnamese: "Chuyển sang tiếng Việt",
    switchToLight: "Chuyển sang giao diện sáng",
    switchToDark: "Chuyển sang giao diện tối",
    loading: "Đang tải...",
    cancel: "Hủy",
    delete: "Xóa",
    edit: "Chỉnh sửa",
    save: "Lưu",
    previous: "Trước",
    next: "Sau",
    present: "Hiện tại",
    photo: "ảnh",
    photos: "ảnh",
    public: "công khai",
    published: "đã đăng",
    draft: "bản nháp",
    archived: "đã lưu trữ",
    private: "riêng tư",
  },
  metadata: {
    description:
      "Trang cá nhân của Võ Đình Quân, nơi tui chia sẻ hành trình làm phần mềm, các dự án và những khoảnh khắc đời thường.",
  },
  home: {
    greeting: "Hi, tui là",
    about: "Về tui",
    work: "Kinh nghiệm",
    education: "Học vấn",
    certifications: "Chứng chỉ",
    skills: "Tuyệt kỹ",
    projectsEyebrow: "Dự án của tui",
    projectsTitle: "Mấy món tui tự tay xây dựng",
    projectsDescription:
      "Từ mấy trang web cỏ đến hệ thống chạy microservices phức tạp.",
    openProject: "Mở dự án",
    hackathons: "Hackathon",
    hackathonsTitle: "Thích code thâu đêm suốt sáng",
    hackathonsDescription:
      "Hồi học đại học, tui hay đi quẩy mấy giải Hackathon cùng anh em đồng bọn, chung tay code thâu đêm để tạo ra sản phẩm thực tế và học hỏi được siêu nhiều thứ.",
    contactEyebrow: "Liên hệ",
    contactTitle: "Ping tui phát để trò chuyện nha",
    contactBeforeLink: "Có kèo gì hay ho? Cứ nhắn cho tui",
    contactLink: "qua LinkedIn",
    contactAfterLink:
      "nha! Có câu hỏi cụ thể càng tốt, tui sẽ rep ngay khi online.",
  },
  blog: {
    title: "Góc viết lách",
    description:
      "Nơi tui ghi chép lại mọi thứ tự học về code, công việc và vài câu chuyện linh tinh trong cuộc sống.",
    posts: "bài",
    page: "Trang",
    of: "trên",
    previous: "Trang trước",
    next: "Trang sau",
    empty: "Chưa viết bài nào cả. Từ từ tui viết nha, ghé lại sau nha!",
    back: "Quay lại danh sách bài viết",
    previousPost: "Bài trước",
    nextPost: "Bài tiếp theo",
    notFound: "Bài này bay màu rồi hoặc không tồn tại!",
  },
  moments: {
    title: "Khoảnh khắc",
    sets: "bộ ảnh",
    paginationAria: "Phân trang Khoảnh khắc",
    nextPage: "Xem bộ ảnh tiếp theo",
    description:
      "Nhật ký ảnh của tui về những chuyến đi, góc phố và mấy thứ linh tinh trông cũng chill chill.",
    curatedBy: "Chia sẻ bởi",
    emptyTitle: "Chưa có khoảnh khắc nào được đăng",
    emptyDescription:
      "Không gian này đã sẵn sàng. Những bộ ảnh mới sẽ xuất hiện tại đây.",
    unavailableTitle: "Khoảnh khắc đang tạm thời không khả dụng",
    unavailableDescription:
      "Nguồn dữ liệu ảnh đang ngoại tuyến hoặc chưa được cấu hình. Các phần còn lại của website vẫn hoạt động bình thường.",
    unavailableHint:
      "Hãy kiểm tra cấu hình Supabase và đảm bảo migration Moments đã được áp dụng trước khi đăng bộ ảnh.",
    goHome: "Về trang chủ",
    back: "Quay lại Khoảnh khắc",
    noPhotos: "Khoảnh khắc này chưa có ảnh công khai.",
    viewFull: "Xem ảnh đầy đủ",
    openFull: "Mở ảnh kích thước đầy đủ",
    fullSize: "ảnh kích thước đầy đủ",
    closeFull: "Đóng ảnh",
    previousPhoto: "Xem ảnh trước",
    nextPhoto: "Xem ảnh tiếp theo",
    photoPosition: "Ảnh",
    positionOf: "trên",
    addEmoji: "Thêm emoji",
    addEmojiHint: "Emoji sẽ được chèn tại vị trí con trỏ hiện tại.",
    searchEmoji: "Tìm emoji",
    loadingEmoji: "Đang tải emoji...",
    noEmoji: "Không tìm thấy emoji phù hợp.",
    addEmojiTo: "Thêm emoji vào",
    formCreateTitle: "Tạo khoảnh khắc",
    formEditTitle: "Chỉnh sửa khoảnh khắc",
    formDescription:
      "Ưu tiên hình ảnh: một tiêu đề, vài thông tin ngắn và ghi chú nếu cần.",
    titleLabel: "Tiêu đề",
    titlePlaceholder: "Những khung hình trên phố Sài Gòn",
    slugLabel: "Slug",
    slugPlaceholder: "nhung-khung-hinh-sai-gon",
    slugHint: "Để trống nếu muốn tạo tự động từ tiêu đề.",
    dateLabel: "Ngày",
    locationLabel: "Địa điểm",
    locationPlaceholder: "TP. Hồ Chí Minh",
    descriptionLabel: "Mô tả",
    descriptionPlaceholder: "Một câu ngắn để hiển thị trên thẻ và metadata.",
    noteLabel: "Ghi chú thêm",
    notePlaceholder: "Ghi chú Markdown ngắn. Bài dài nên để ở /blog.",
    saveChanges: "Lưu thay đổi",
    create: "Tạo khoảnh khắc",
    uploadTitle: "Tải ảnh lên",
    uploadDescription:
      "Ảnh được lưu trên Cloudinary. Chỉ phiên đăng nhập của chủ sở hữu mới có thể yêu cầu thông tin tải lên.",
    choosePhotos: "Chọn một hoặc nhiều ảnh",
    uploadHint: "Ảnh được tải trực tiếp vào thư mục Cloudinary riêng.",
    uploadAria: "Tải ảnh cho khoảnh khắc",
    uploadProgress: "Tiến độ tải ảnh",
    noFiles: "Chưa chọn tệp nào.",
    signedUpload: "Tải lên đã xác thực",
    signatureError: "Không thể tạo chữ ký tải ảnh.",
    malformedSignature: "Phản hồi chữ ký tải ảnh không hợp lệ.",
    providerRejected: "Cloudinary đã từ chối",
    uploading: "Đang tải",
    uploadSaving: "Đang lưu",
    uploadLimitFiles: "Chỉ có thể tải tối đa {count} ảnh mỗi lần.",
    uploadLimitSize: "Mỗi ảnh có dung lượng tối đa 10 MB.",
    uploadUnsupported: "Chỉ hỗ trợ ảnh AVIF, JPEG, PNG và WebP.",
    uploaded: "Đã tải",
    image: "ảnh",
    images: "ảnh",
    uploadComplete: "Tải ảnh hoàn tất.",
    uploadFailed: "Tải ảnh thất bại.",
    assetsEmpty:
      "Chưa có ảnh nào. Hãy tải vài tấm lên để bắt đầu hoàn thiện khoảnh khắc này.",
    cover: "Ảnh bìa",
    sort: "Thứ tự",
    altText: "Văn bản thay thế",
    caption: "Chú thích",
    savePhoto: "Lưu thông tin ảnh",
    setCover: "Đặt làm ảnh bìa",
    deletePhotoTitle: "Xóa ảnh này?",
    deletePhotoDescription:
      "Ảnh sẽ bị gỡ khỏi Khoảnh khắc và không thể khôi phục từ Studio.",
    deletePhoto: "Xóa ảnh",
    ownerStudio: "Studio của chủ sở hữu",
    ownerStudioDescription:
      "Tạo, tải ảnh, chỉnh sửa và đăng các bộ ảnh cá nhân.",
    newMoment: "Khoảnh khắc mới",
    setupTitle: "Cần thiết lập cơ sở dữ liệu Moments",
    setupDescription:
      "Xác thực chủ sở hữu đã hoạt động, nhưng dự án Supabase từ xa chưa có các bảng Moments.",
    setupHintBefore: "Hãy chạy",
    setupHintAfter:
      "trên dự án Supabase đã liên kết trước khi tạo bộ ảnh.",
    studioUnavailable: "Studio đang tạm thời không khả dụng",
    studioUnavailableDescription:
      "Không thể tải dữ liệu Moments. Hãy kiểm tra kết nối và policy của Supabase rồi thử lại.",
    firstSetTitle: "Bộ ảnh đầu tiên bắt đầu từ đây",
    firstSetDescription:
      "Bắt đầu bằng một tiêu đề, sau đó thêm ảnh được lưu trên Cloudinary.",
    viewPublic: "Xem bản công khai",
    backToStudio: "Quay lại Studio",
    backToMoments: "Quay lại danh sách Moments",
    publicView: "Xem trang công khai",
    photosSection: "Ảnh",
    photosSectionDescription:
      "Chỉnh chú thích, chọn ảnh bìa và sắp xếp thứ tự hiển thị.",
    publishing: "Xuất bản",
    publishingDescription:
      "Kiểm soát thời điểm bộ ảnh xuất hiện trên website công khai.",
    publish: "Đăng",
    archive: "Lưu trữ",
    deleteMoment: "Xóa khoảnh khắc",
    deleteMomentTitle: "Xóa",
    deleteMomentDescription:
      "Khoảnh khắc và liên kết tới các bản ghi ảnh sẽ bị xóa vĩnh viễn. Thao tác này không thể hoàn tác.",
    deletePermanently: "Xóa vĩnh viễn",
  },
  studio: {
    title: "Studio",
    ownerOnly: "Chỉ chủ sở hữu",
    description:
      "Không gian riêng để quản lý nội dung cho website cá nhân, gọn gàng và bám sát những trang công khai được cập nhật.",
    routesTitle: "Khu vực quản lý",
    routesDescription: "Chọn phần bạn muốn chỉnh sửa.",
    momentsManager: "Quản lý Moments",
    momentsManagerDescription:
      "Xem bản nháp, chỉnh thông tin, tải ảnh và xuất bản.",
    createMoment: "Tạo khoảnh khắc",
    createMomentDescription:
      "Bắt đầu một bộ ảnh mới với tiêu đề và vài thông tin ngắn.",
    publicMoments: "Trang Moments công khai",
    publicMomentsDescription:
      "Xem bộ sưu tập đúng như cách khách truy cập nhìn thấy.",
    dragPreview: "thẻ trang trí",
    workspaceTitle: "Không gian Moments",
    workspaceDescription:
      "Thẻ kéo thả chỉ là điểm nhấn trực quan; danh sách chức năng chính vẫn rõ ràng và thân thiện với bàn phím.",
    openMoments: "Mở Moments",
    privateTitle: "Studio là không gian riêng tư",
    githubRequired: "Cần GitHub",
    privateDescriptionBefore:
      "Khu vực này quản lý nội dung xuất bản của website và chỉ dành cho tài khoản GitHub có id",
    signedInUnauthorizedBefore: "Bạn đang đăng nhập",
    signedInAs: "bằng",
    signedInUnauthorizedAfter:
      "nhưng phiên GitHub này không có quyền vào Studio. Hãy đăng xuất nếu bạn cần đổi sang tài khoản chủ sở hữu.",
    signInHint:
      "Đăng nhập bằng GitHub để tiếp tục. Tài khoản không phải chủ sở hữu vẫn sẽ bị chặn khỏi các route Studio.",
    loginGitHub: "Đăng nhập bằng GitHub",
    signOutCurrent: "Đăng xuất phiên hiện tại",
    viewOwner: "Xem hồ sơ chủ sở hữu",
  },
  auth: {
    authentication: "Xác thực",
    ownerOnlyTitle: "Khu vực này chỉ dành cho chủ sở hữu",
    signInFailedTitle: "Không thể hoàn tất đăng nhập GitHub",
    unauthorizedDescription:
      "Phiên GitHub đã được đóng vì không khớp với tài khoản chủ sở hữu được cấu hình cho website.",
    retryDescription:
      "Bạn hãy quay lại Studio và thử đăng nhập thêm một lần nữa.",
    backToStudio: "Quay lại Studio",
    signInGitHub: "Đăng nhập bằng GitHub",
    signOut: "Đăng xuất",
  },
  notFound: {
    title: "Không tìm thấy trang",
    description:
      "Trang bạn đang tìm không tồn tại hoặc có thể đã được chuyển sang địa chỉ khác.",
    home: "Về trang chủ",
  },
  mdx: {
    copyCode: "Sao chép mã",
    copied: "Đã sao chép mã.",
    copyFailed: "Không thể sao chép mã.",
  },
} as const;

export type Dictionary = DeepStringShape<typeof vi>;

const en = {
  common: {
    home: "Home",
    blog: "Blog",
    moments: "Moments",
    studio: "Studio",
    linkedin: "LinkedIn",
    switchToEnglish: "Switch to English",
    switchToVietnamese: "Switch to Vietnamese",
    switchToLight: "Switch to light theme",
    switchToDark: "Switch to dark theme",
    loading: "Loading...",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    save: "Save",
    previous: "Previous",
    next: "Next",
    present: "Present",
    photo: "photo",
    photos: "photos",
    public: "public",
    published: "published",
    draft: "draft",
    archived: "archived",
    private: "private",
  },
  metadata: {
    description:
      "Vo Dinh Quan's personal website for software engineering work, projects, writing, and everyday moments.",
  },
  home: {
    greeting: "Hi, I'm",
    about: "About",
    work: "Work Experience",
    education: "Education",
    certifications: "Certifications",
    skills: "Skills",
    projectsEyebrow: "My Projects",
    projectsTitle: "Check out my latest work",
    projectsDescription:
      "I've worked on projects ranging from small websites to complex web systems. Here are a few favorites.",
    openProject: "Open project",
    hackathons: "Hackathons",
    hackathonsTitle: "I like building things",
    hackathonsDescription:
      "During university, I joined hackathons where motivated teams built useful products in just a few days. They were a great way to learn by making.",
    contactEyebrow: "Contact",
    contactTitle: "Let's get in touch",
    contactBeforeLink: "Want to chat? Send me",
    contactLink: "a message on LinkedIn",
    contactAfterLink:
      "with a direct question and I'll respond whenever I can.",
  },
  blog: {
    title: "Blog",
    description: "Thoughts on software development, work, and life.",
    posts: "posts",
    page: "Page",
    of: "of",
    previous: "Previous",
    next: "Next",
    empty: "No blog posts yet. Check back soon!",
    back: "Back to Blog",
    previousPost: "Previous",
    nextPost: "Next",
    notFound: "Post Not Found",
  },
  moments: {
    title: "Moments",
    sets: "sets",
    paginationAria: "Moments pagination",
    nextPage: "View next set",
    description:
      "A small visual diary of trips, street frames, and quiet scenes. Photo-first and curated by hand.",
    curatedBy: "Curated by",
    emptyTitle: "No moments published yet",
    emptyDescription:
      "The gallery is ready. Published photo sets will appear here.",
    unavailableTitle: "Moments are temporarily unavailable",
    unavailableDescription:
      "The photo data source is offline or not configured. The rest of the site is still available.",
    unavailableHint:
      "Check the Supabase URL and ensure the Moments migration has been applied before publishing photo sets.",
    goHome: "Go to Home",
    back: "Back to Moments",
    noPhotos: "This moment has no published photos yet.",
    viewFull: "View full",
    openFull: "Open full-size photo",
    fullSize: "full-size photo",
    closeFull: "Close full-size photo",
    previousPhoto: "Show previous photo",
    nextPhoto: "Show next photo",
    photoPosition: "Photo",
    positionOf: "of",
    addEmoji: "Add emoji",
    addEmojiHint: "Insert at the current cursor position.",
    searchEmoji: "Search emoji",
    loadingEmoji: "Loading emojis...",
    noEmoji: "No emojis found.",
    addEmojiTo: "Add emoji to",
    formCreateTitle: "Create moment",
    formEditTitle: "Edit moment",
    formDescription:
      "Keep it photo-first: a title, optional metadata, and a short note.",
    titleLabel: "Title",
    titlePlaceholder: "Street frames in Saigon",
    slugLabel: "Slug",
    slugPlaceholder: "street-frames-in-saigon",
    slugHint: "Leave blank to generate from the title.",
    dateLabel: "Date",
    locationLabel: "Location",
    locationPlaceholder: "Ho Chi Minh City",
    descriptionLabel: "Description",
    descriptionPlaceholder: "A one-line description for cards and metadata.",
    noteLabel: "Optional note",
    notePlaceholder: "Short markdown note. Keep long essays in /blog.",
    saveChanges: "Save changes",
    create: "Create moment",
    uploadTitle: "Upload photos",
    uploadDescription:
      "Images go to Cloudinary. Only signed owner sessions can request upload parameters.",
    choosePhotos: "Choose one or more photos",
    uploadHint:
      "Images upload directly to the owner-only Cloudinary folder.",
    uploadAria: "Upload moment photos",
    uploadProgress: "Photo upload progress",
    noFiles: "No files selected.",
    signedUpload: "Signed owner upload",
    signatureError: "Could not create an upload signature.",
    malformedSignature: "Upload signature response was malformed.",
    providerRejected: "Cloudinary rejected",
    uploading: "Uploading",
    uploadSaving: "Saving",
    uploadLimitFiles: "You can upload up to {count} images at a time.",
    uploadLimitSize: "Each image can be up to 10 MB.",
    uploadUnsupported: "Only AVIF, JPEG, PNG, and WebP images are supported.",
    uploaded: "Uploaded",
    image: "image",
    images: "images",
    uploadComplete: "Upload complete.",
    uploadFailed: "Upload failed.",
    assetsEmpty:
      "No photos attached yet. Upload a few images to start shaping this moment.",
    cover: "Cover",
    sort: "Sort",
    altText: "Alt text",
    caption: "Caption",
    savePhoto: "Save photo metadata",
    setCover: "Set cover",
    deletePhotoTitle: "Delete this photo?",
    deletePhotoDescription:
      "This removes the photo from the Moment. The action cannot be undone from Studio.",
    deletePhoto: "Delete photo",
    ownerStudio: "Owner Studio",
    ownerStudioDescription:
      "Create, upload, edit, and publish personal photo sets.",
    newMoment: "New moment",
    setupTitle: "Moments database setup required",
    setupDescription:
      "Owner authentication is working, but the remote Supabase project does not have the Moments tables yet.",
    setupHintBefore: "Apply",
    setupHintAfter:
      "to the linked Supabase project before creating photo sets.",
    studioUnavailable: "Studio is temporarily unavailable",
    studioUnavailableDescription:
      "The Moments data source could not be loaded. Try again after checking the Supabase connection and policies.",
    firstSetTitle: "Your first photo set starts here",
    firstSetDescription:
      "Start with a title, then attach Cloudinary-hosted photos.",
    viewPublic: "View public",
    backToStudio: "Back to Studio",
    backToMoments: "Back to Moments",
    publicView: "Public view",
    photosSection: "Photos",
    photosSectionDescription:
      "Edit captions, choose the cover, and control display order.",
    publishing: "Publishing",
    publishingDescription:
      "Control when this photo set appears on the public site.",
    publish: "Publish",
    archive: "Archive",
    deleteMoment: "Delete moment",
    deleteMomentTitle: "Delete",
    deleteMomentDescription:
      "This permanently removes the Moment and detaches its photo records. This action cannot be undone.",
    deletePermanently: "Delete permanently",
  },
  studio: {
    title: "Studio",
    ownerOnly: "Owner only",
    description:
      "A private workspace for shaping the personal site with focused publishing tools close to the public routes they affect.",
    routesTitle: "Routes",
    routesDescription: "Pick the owner surface you want to work with.",
    momentsManager: "Moments manager",
    momentsManagerDescription:
      "Review drafts, edit metadata, upload photos, and publish.",
    createMoment: "Create moment",
    createMomentDescription:
      "Start a new photo-first collection with title and metadata.",
    publicMoments: "Public moments",
    publicMomentsDescription:
      "See the public gallery exactly as visitors see it.",
    dragPreview: "drag preview",
    workspaceTitle: "Moments workspace",
    workspaceDescription:
      "The playful card is only a visual accent; the real route list stays predictable and keyboard-friendly.",
    openMoments: "Open Moments",
    privateTitle: "Studio is private",
    githubRequired: "GitHub required",
    privateDescriptionBefore:
      "This workspace controls publishing tools for the personal site. Access is limited to the GitHub owner id",
    signedInUnauthorizedBefore: "You are signed in",
    signedInAs: "as",
    signedInUnauthorizedAfter:
      "but this GitHub session is not authorized for Studio. Sign out first if you need to switch to the owner account.",
    signInHint:
      "Sign in with GitHub to continue. Non-owner accounts will remain blocked from the Studio routes.",
    loginGitHub: "Login via GitHub",
    signOutCurrent: "Sign out current session",
    viewOwner: "View owner profile",
  },
  auth: {
    authentication: "Authentication",
    ownerOnlyTitle: "This workspace is owner-only",
    signInFailedTitle: "GitHub sign-in could not be completed",
    unauthorizedDescription:
      "The GitHub session was closed because this personal workspace only accepts its configured owner account.",
    retryDescription:
      "Please return to Studio and try signing in again.",
    backToStudio: "Back to Studio",
    signInGitHub: "Sign in with GitHub",
    signOut: "Sign out",
  },
  notFound: {
    title: "Page Not Found",
    description:
      "The page you're looking for doesn't exist or may have been moved.",
    home: "Go to Home",
  },
  mdx: {
    copyCode: "Copy code",
    copied: "Code copied.",
    copyFailed: "Unable to copy code.",
  },
} satisfies Dictionary;

const dictionaries = { en, vi } satisfies Record<Locale, Dictionary>;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
