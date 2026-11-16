
import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";

import {
  LayoutDashboard,
  Images,
  Upload,
  Settings,
  Search,
  Image as ImageIcon,
  HardDrive,
  Trash2,
  Menu,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Copy,
  ExternalLink,
  Grid3X3,
  List,
  CloudUpload,
  Eye,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  FileImage,
  Calendar,
  ArrowUpDown
} from "lucide-react";

const API_URL = "http://localhost:5000/api";
const PAGE_SIZE = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function App() {
  // Application navigation
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  // Backend
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(true);

  // Upload
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Gallery
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("Newest");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);

  // Image viewer and deletion
  const [selectedImage, setSelectedImage] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Notifications
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  // Backend connection
  const checkBackend = async () => {
    try {
      const response = await axios.get(`${API_URL}/health`);
      setBackendStatus(response.data.message || "Connected");
    } catch {
      setBackendStatus("Backend disconnected");
    }
  };

  // Fetch images
  const fetchImages = async () => {
    try {
      setLoadingImages(true);
      setError("");

      const response = await axios.get(`${API_URL}/images`);

      setImages(response.data.images || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to fetch images."
      );
    } finally {
      setLoadingImages(false);
    }
  };

  useEffect(() => {
    checkBackend();
    fetchImages();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedImage(null);
      }

      if (
        event.key === "/" &&
        !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)
      ) {
        event.preventDefault();
        setActiveTab("My Images");
        setTimeout(() => {
          document.getElementById("image-search")?.focus();
        }, 100);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // Notifications
  const showMessage = (text) => {
    setError("");
    setMessage(text);
  };

  const showError = (text) => {
    setMessage("");
    setError(text);
  };

  // File size formatting
  const formatSize = (bytes = 0) => {
    if (!bytes) return "0 KB";

    if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    }

    return (bytes / 1024).toFixed(2) + " KB";
  };

  // Date formatting
  const formatDate = (date) => {
    if (!date) return "Recently uploaded";

    const parsed = new Date(date);

    if (isNaN(parsed.getTime())) {
      return "Recently uploaded";
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  // Select image for preview
  const selectFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showError("Please select a valid image.");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
      showError("Only JPG, JPEG, PNG and WEBP are supported.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showError("Image size must be less than 5 MB.");
      return;
    }

    setMessage("");
    setError("");
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // File input handler
  const handleFileChange = (event) => {
    selectFile(event.target.files[0]);
  };

  // Drag and drop handler
  const handleDrop = (event) => {
    event.preventDefault();

    if (uploading) return;

    const file = event.dataTransfer.files[0];

    selectFile(file);
  };

  // Cancel preview
  const cancelPreview = () => {
    setSelectedFile(null);
    setPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Upload image to ImageKit through backend
  const uploadImage = async () => {
    if (!selectedFile || uploading) return;

    const formData = new FormData();

    formData.append("image", selectedFile);

    try {
      setUploading(true);
      setUploadProgress(0);
      setError("");
      setMessage("");

      const response = await axios.post(
        `${API_URL}/images`,
        formData,
        {
          onUploadProgress: (event) => {
            if (event.total) {
              setUploadProgress(
                Math.round((event.loaded * 100) / event.total)
              );
            }
          }
        }
      );

      setImages((previous) => [
        response.data.image,
        ...previous
      ]);

      setSelectedFile(null);
      setPreview(null);

      setCurrentPage(1);
      setActiveTab("My Images");

      showMessage("Image uploaded successfully!");

    } catch (err) {
      showError(
        err.response?.data?.message || "Image upload failed."
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Delete image
  const deleteImage = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this image?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");
      setMessage("");

      await axios.delete(`${API_URL}/images/${id}`);

      setImages((previous) =>
        previous.filter((image) => image._id !== id)
      );

      setSelectedImage((previous) =>
        previous?._id === id ? null : previous
      );

      showMessage("Image deleted successfully!");

    } catch (err) {
      showError(
        err.response?.data?.message || "Unable to delete image."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Copy URL
  const copyImageUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      showMessage("Image URL copied successfully!");
    } catch {
      showError("Unable to copy image URL.");
    }
  };

  // Download image
  const downloadImage = async (image) => {
    try {
      const response = await fetch(image.imageUrl);

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = image.name || "image";
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);

      showMessage("Download started!");

    } catch {
      showError("Unable to download image.");
    }
  };

  // Search, filter and sorting
  const filteredImages = useMemo(() => {
    let result = images.filter((image) => {
      const name = (image.name || "").toLowerCase();

      return name.includes(search.toLowerCase());
    });

    if (filter !== "All") {
      result = result.filter((image) =>
        (image.name || "")
          .toLowerCase()
          .endsWith(filter.toLowerCase())
      );
    }

    result = [...result].sort((a, b) => {
      if (sort === "Name") {
        return (a.name || "").localeCompare(b.name || "");
      }

      if (sort === "Largest") {
        return (b.size || 0) - (a.size || 0);
      }

      return (
        new Date(b.createdAt || b.updatedAt || 0) -
        new Date(a.createdAt || a.updatedAt || 0)
      );
    });

    return result;
  }, [images, search, filter, sort]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredImages.length / PAGE_SIZE)
  );

  const paginatedImages = filteredImages.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter, sort]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Dashboard statistics
  const totalStorage = images.reduce(
    (total, image) => total + (image.size || 0),
    0
  );

  const averageSize = images.length
    ? totalStorage / images.length
    : 0;

  const imageTypes = new Set(
    images.map((image) => {
      const extension = (image.name || "")
        .split(".")
        .pop()
        .toUpperCase();

      return extension;
    })
  ).size;

  const isConnected =
    !backendStatus.toLowerCase().includes("disconnected") &&
    backendStatus !== "Checking...";

  const navigation = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "My Images", icon: Images },
    { name: "Settings", icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-[#080d18] text-white flex">

      {/* SIDEBAR */}
      <aside
        className={`fixed md:sticky top-0 z-30 w-64 h-screen bg-[#0d1423] border-r border-slate-800 p-6 ${
          menuOpen ? "block" : "hidden md:block"
        }`}
      >
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-2xl font-bold text-emerald-400">
              Image<span className="text-white">Vault.</span>
            </h1>

            <p className="text-xs text-slate-500 mt-1">
              Your cloud image manager
            </p>
          </div>

          <button
            className="md:hidden"
            onClick={() => setMenuOpen(false)}
          >
            <X />
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-4 uppercase tracking-widest">
          Workspace
        </p>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.name);
                  setMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${
                  activeTab === item.name
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={19} />
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="mt-12 bg-[#151f30] rounded-2xl p-4">
          <HardDrive className="text-emerald-400 mb-3" />

          <p className="text-sm font-semibold">Storage used</p>

          <p className="text-xl font-bold mt-2">
            {formatSize(totalStorage)}
          </p>

          <p className="text-xs text-slate-500 mt-2">
            Total uploaded image size
          </p>
        </div>

        <div className="absolute bottom-6 left-6 right-6 border-t border-slate-800 pt-5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-emerald-400" : "bg-red-400"
              }`}
            />

            {backendStatus}
          </div>

          <p className="text-xs text-slate-600 mt-3">
            ImageVault v2.0
          </p>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 min-w-0 p-5 md:p-9">

        {/* HEADER */}
        <header className="flex items-center justify-between mb-9">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden"
              onClick={() => setMenuOpen(true)}
            >
              <Menu />
            </button>

            <div>
              <p className="text-sm text-slate-400">
                Welcome to your workspace
              </p>

              <h2 className="text-2xl font-bold">
                {activeTab}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                checkBackend();
                fetchImages();
              }}
              className="p-3 bg-[#151f30] rounded-xl text-slate-300 hover:text-emerald-400"
              title="Refresh"
            >
              <RefreshCw size={19} />
            </button>

            <div className="w-10 h-10 rounded-full bg-emerald-400 flex items-center justify-center font-bold text-slate-950">
              S
            </div>
          </div>
        </header>

        {/* GLOBAL FILE INPUT */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={uploading}
          onChange={handleFileChange}
        />

        {/* SUCCESS NOTIFICATION */}
        {message && (
          <div className="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2">
            <CheckCircle size={18} />

            <span className="text-sm">{message}</span>

            <button
              className="ml-auto"
              onClick={() => setMessage("")}
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* ERROR NOTIFICATION */}
        {error && (
          <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-2">
            <AlertCircle size={18} />

            <span className="text-sm">{error}</span>

            <button
              className="ml-auto"
              onClick={() => setError("")}
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* SELECTED IMAGE PREVIEW */}
        {preview && (
          <section className="mb-7 bg-[#111b2b] border border-emerald-500/30 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4">
              Preview Selected Image
            </h2>

            <div className="flex flex-col md:flex-row gap-6 items-center">
              <img
                src={preview}
                alt="Selected preview"
                className="w-full md:w-64 h-52 object-contain bg-black/30 rounded-xl"
              />

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold break-all">
                  {selectedFile?.name}
                </h3>

                <p className="text-sm text-slate-400 mt-2">
                  Size: {formatSize(selectedFile?.size)}
                </p>

                <p className="text-sm text-emerald-400 mt-2">
                  Ready to upload
                </p>

                <div className="flex flex-wrap gap-3 mt-5">
                  <button
                    onClick={uploadImage}
                    disabled={uploading}
                    className="bg-emerald-400 text-slate-950 px-5 py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center gap-2"
                  >
                    {uploading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Upload size={18} />
                    )}

                    {uploading ? "Uploading..." : "Upload Image"}
                  </button>

                  <button
                    onClick={cancelPreview}
                    disabled={uploading}
                    className="bg-slate-800 px-5 py-3 rounded-xl font-semibold disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* UPLOAD PROGRESS */}
        {uploading && (
          <div className="bg-[#111b2b] border border-slate-800 rounded-xl p-5 mb-7">
            <div className="flex justify-between mb-3 text-sm">
              <span>Uploading to ImageKit...</span>

              <span className="text-emerald-400">
                {uploadProgress}%
              </span>
            </div>

            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* DASHBOARD */}
        {activeTab === "Dashboard" && (
          <>
            <section className="bg-gradient-to-r from-emerald-950 to-[#142b36] border border-emerald-900/50 rounded-2xl p-7 md:p-9 mb-8">
              <div className="max-w-xl">
                <span className="text-emerald-400 text-sm font-semibold">
                  YOUR DIGITAL LIBRARY
                </span>

                <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-3">
                  Every image.
                  <br />

                  <span className="text-emerald-400">
                    One beautiful space.
                  </span>
                </h2>

                <p className="text-slate-400 text-sm mb-7">
                  Upload, organize, discover and manage your
                  favorite images with ImageVault.
                </p>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 bg-emerald-400 text-slate-950 font-semibold px-5 py-3 rounded-xl hover:bg-emerald-300 disabled:opacity-50"
                >
                  <Upload size={18} />
                  Upload Image
                </button>
              </div>
            </section>

            {/* STATISTICS */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-9">
              <StatCard
                title="Total Images"
                value={images.length}
                description="Images in your library"
                icon={ImageIcon}
              />

              <StatCard
                title="Storage Used"
                value={formatSize(totalStorage)}
                description="Combined image size"
                icon={HardDrive}
              />

              <StatCard
                title="Cloud Status"
                value={isConnected ? "Online" : "Offline"}
                description="Backend connection"
                icon={CloudUpload}
              />

              <StatCard
                title="Average Size"
                value={formatSize(averageSize)}
                description="Average per image"
                icon={FileImage}
              />

              <StatCard
                title="File Formats"
                value={imageTypes}
                description="Different formats stored"
                icon={Images}
              />

              <StatCard
                title="Search Results"
                value={filteredImages.length}
                description="Matching images"
                icon={Search}
              />
            </section>

            {/* DRAG AND DROP */}
            <section
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-8 text-center mb-9 transition bg-[#0d1423]"
            >
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CloudUpload className="text-emerald-400" size={28} />
              </div>

              <h3 className="font-semibold text-lg">
                Drop your images here
              </h3>

              <p className="text-sm text-slate-500 mt-2">
                Images will be previewed before uploading
              </p>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-emerald-400 text-sm font-semibold mt-4 hover:text-emerald-300"
              >
                Browse files
              </button>

              <p className="text-xs text-slate-600 mt-3">
                JPG, PNG, WEBP · Maximum 5 MB
              </p>
            </section>

            {/* RECENT UPLOADS */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold">
                    Recent uploads
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Your latest images
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab("My Images")}
                  className="text-sm text-emerald-400"
                >
                  View all →
                </button>
              </div>

              <ImageGrid
                images={[...images]
                  .sort((a, b) =>
                    new Date(b.createdAt || 0) -
                    new Date(a.createdAt || 0)
                  )
                  .slice(0, 3)}
                deletingId={deletingId}
                onSelect={setSelectedImage}
                onDelete={deleteImage}
                formatSize={formatSize}
              />
            </section>
          </>
        )}

        {/* MY IMAGES */}
        {activeTab === "My Images" && (
          <section>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-7">
              <div>
                <h2 className="text-xl font-bold">
                  All Images
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {filteredImages.length} images found
                </p>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="bg-emerald-400 text-slate-950 px-5 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                <Upload size={18} />
                Upload new
              </button>
            </div>

            {/* SEARCH AND FILTER */}
            <div className="flex flex-col md:flex-row gap-3 mb-7">
              <div className="flex items-center gap-2 bg-[#111b2b] border border-slate-800 rounded-xl px-4 py-3 flex-1">
                <Search size={18} className="text-slate-500" />

                <input
                  id="image-search"
                  type="text"
                  placeholder="Search your images... (Press /)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent outline-none text-sm w-full"
                />
              </div>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-[#111b2b] border border-slate-800 rounded-xl px-4 py-3 text-sm outline-none"
              >
                <option value="All">All formats</option>
                <option value=".jpg">JPG</option>
                <option value=".jpeg">JPEG</option>
                <option value=".png">PNG</option>
                <option value=".webp">WEBP</option>
              </select>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-[#111b2b] border border-slate-800 rounded-xl px-4 py-3 text-sm outline-none"
              >
                <option value="Newest">Newest first</option>
                <option value="Name">Name A-Z</option>
                <option value="Largest">Largest first</option>
              </select>

              <div className="flex bg-[#111b2b] border border-slate-800 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg ${
                    viewMode === "grid"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "text-slate-500"
                  }`}
                  title="Grid view"
                >
                  <Grid3X3 size={19} />
                </button>

                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg ${
                    viewMode === "list"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "text-slate-500"
                  }`}
                  title="List view"
                >
                  <List size={19} />
                </button>
              </div>
            </div>

            {/* IMAGE RESULTS */}
            {loadingImages ? (
              <LoadingState />
            ) : filteredImages.length === 0 ? (
              <EmptyState
                search={search}
                onUpload={() => fileInputRef.current?.click()}
              />
            ) : (
              <>
                <ImageGrid
                  images={paginatedImages}
                  deletingId={deletingId}
                  onSelect={setSelectedImage}
                  onDelete={deleteImage}
                  formatSize={formatSize}
                  viewMode={viewMode}
                />

                {/* PAGINATION */}
                <div className="flex flex-wrap items-center justify-between gap-4 mt-8 border-t border-slate-800 pt-5">
                  <p className="text-sm text-slate-400">
                    Showing{" "}
                    {Math.min(
                      (currentPage - 1) * PAGE_SIZE + 1,
                      filteredImages.length
                    )}
                    {" - "}
                    {Math.min(
                      currentPage * PAGE_SIZE,
                      filteredImages.length
                    )}
                    {" of "}
                    {filteredImages.length}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.max(1, p - 1))
                      }
                      disabled={currentPage === 1}
                      className="p-2 bg-[#111b2b] rounded-lg disabled:opacity-30"
                    >
                      <ChevronLeft size={19} />
                    </button>

                    <span className="text-sm text-slate-300 px-3">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      onClick={() =>
                        setCurrentPage((p) =>
                          Math.min(totalPages, p + 1)
                        )
                      }
                      disabled={currentPage === totalPages}
                      className="p-2 bg-[#111b2b] rounded-lg disabled:opacity-30"
                    >
                      <ChevronRight size={19} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        )}

        {/* SETTINGS */}
        {activeTab === "Settings" && (
          <section className="max-w-3xl space-y-5">
            <div className="bg-[#111b2b] border border-slate-800 rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-5">
                Application settings
              </h3>

              <SettingRow title="Application" value="ImageVault" />
              <SettingRow title="Version" value="2.0" />
              <SettingRow title="Frontend" value="React + Vite" />
              <SettingRow title="Backend" value="Node.js + Express" />
              <SettingRow title="Database" value="MongoDB" />
              <SettingRow title="Image hosting" value="ImageKit" />
              <SettingRow title="Pagination" value="10 images per page" />
            </div>

            <div className="bg-[#111b2b] border border-slate-800 rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4">
                Connection status
              </h3>

              <div className="flex items-center gap-3">
                <span
                  className={`w-3 h-3 rounded-full ${
                    isConnected ? "bg-emerald-400" : "bg-red-400"
                  }`}
                />

                <span className="text-sm text-slate-300">
                  {backendStatus}
                </span>
              </div>

              <button
                onClick={checkBackend}
                className="mt-5 text-sm text-emerald-400 flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Check connection
              </button>
            </div>

            <div className="bg-[#111b2b] border border-slate-800 rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4">
                Storage information
              </h3>

              <SettingRow
                title="Total images"
                value={images.length}
              />

              <SettingRow
                title="Total storage"
                value={formatSize(totalStorage)}
              />

              <SettingRow
                title="Maximum file size"
                value="5 MB"
              />

              <SettingRow
                title="Supported formats"
                value="JPG, JPEG, PNG, WEBP"
              />
            </div>

            <div className="bg-[#111b2b] border border-slate-800 rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-3">
                Keyboard shortcuts
              </h3>

              <SettingRow title="Open image search" value="/" />
              <SettingRow title="Close image preview" value="ESC" />
            </div>
          </section>
        )}
      </main>

      {/* IMAGE VIEWER MODAL */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-[#111b2b] border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="min-w-0">
                <h3 className="font-semibold truncate">
                  {selectedImage.name}
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  {formatSize(selectedImage.size)}
                  {" · "}
                  {formatDate(
                    selectedImage.createdAt || selectedImage.updatedAt
                  )}
                </p>
              </div>

              <button
                onClick={() => setSelectedImage(null)}
                className="p-2 hover:bg-slate-800 rounded-lg"
              >
                <X />
              </button>
            </div>

            <div className="bg-black/30 flex items-center justify-center p-3 min-h-64">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.name}
                className="max-h-[65vh] max-w-full object-contain rounded-lg"
              />
            </div>

            <div className="flex flex-wrap gap-3 p-4">
              <button
                onClick={() =>
                  copyImageUrl(selectedImage.imageUrl)
                }
                className="flex-1 min-w-28 bg-emerald-500/10 text-emerald-400 p-3 rounded-xl text-sm flex items-center justify-center gap-2"
              >
                <Copy size={16} />
                Copy URL
              </button>

              <button
                onClick={() => downloadImage(selectedImage)}
                className="flex-1 min-w-28 bg-slate-800 p-3 rounded-xl text-sm flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Download
              </button>

              <a
                href={selectedImage.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 min-w-28 bg-slate-800 p-3 rounded-xl text-sm flex items-center justify-center gap-2"
              >
                <ExternalLink size={16} />
                Open original
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// STATISTICS CARD
function StatCard({ title, value, description, icon: Icon }) {
  return (
    <div className="bg-[#111b2b] border border-slate-800 rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">{title}</p>
        <Icon className="text-emerald-400" size={21} />
      </div>

      <h2 className="text-3xl font-bold mt-5">
        {value}
      </h2>

      <p className="text-xs text-slate-500 mt-2">
        {description}
      </p>
    </div>
  );
}

// LOADING STATE
function LoadingState() {
  return (
    <div className="flex flex-col items-center py-16 text-slate-400">
      <Loader2
        size={32}
        className="animate-spin text-emerald-400 mb-3"
      />
      Loading your images...
    </div>
  );
}

// EMPTY STATE
function EmptyState({ search, onUpload }) {
  return (
    <div className="text-center py-16 bg-[#111b2b] rounded-2xl border border-slate-800">
      <FolderOpen
        size={42}
        className="mx-auto text-slate-600 mb-4"
      />

      <h3 className="font-semibold">
        {search
          ? "No matching images found"
          : "Your gallery is empty"}
      </h3>

      <p className="text-sm text-slate-500 mt-2">
        Upload images to build your personal library.
      </p>

      <button
        onClick={onUpload}
        className="mt-5 bg-emerald-400 text-slate-950 px-5 py-3 rounded-xl text-sm font-semibold"
      >
        Upload your first image
      </button>
    </div>
  );
}

// IMAGE GALLERY
function ImageGrid({
  images,
  deletingId,
  onSelect,
  onDelete,
  formatSize,
  viewMode = "grid"
}) {
  if (images.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <Images size={35} className="mx-auto mb-3" />
        No images available yet.
      </div>
    );
  }

  return (
    <div
      className={
        viewMode === "list"
          ? "space-y-3"
          : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
      }
    >
      {images.map((image) => (
        <div
          key={image._id}
          className={`bg-[#111b2b] border border-slate-800 rounded-2xl overflow-hidden group ${
            viewMode === "list"
              ? "flex items-center gap-4 p-3"
              : ""
          }`}
        >
          <div
            className={`overflow-hidden cursor-pointer ${
              viewMode === "list"
                ? "w-24 h-20 shrink-0 rounded-xl"
                : "h-48"
            }`}
            onClick={() => onSelect(image)}
          >
            <img
              src={image.imageUrl}
              alt={image.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
          </div>

          <div
            className={`p-4 flex items-center justify-between gap-3 min-w-0 ${
              viewMode === "list" ? "flex-1" : ""
            }`}
          >
            <div className="min-w-0">
              <h3 className="font-semibold text-sm truncate">
                {image.name}
              </h3>

              <p className="text-xs text-slate-500 mt-1">
                {formatSize(image.size)}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onSelect(image)}
                className="p-2 text-slate-400 hover:text-emerald-400"
                title="Preview"
              >
                <Eye size={17} />
              </button>

              <button
                onClick={() => onDelete(image._id)}
                disabled={deletingId === image._id}
                className="p-2 text-slate-400 hover:text-red-400 disabled:opacity-50"
                title="Delete image"
              >
                {deletingId === image._id ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Trash2 size={17} />
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// SETTINGS ROW
function SettingRow({ title, value }) {
  return (
    <div className="flex justify-between gap-4 py-4 border-b border-slate-800 last:border-0">
      <span className="text-sm text-slate-400">
        {title}
      </span>

      <span className="text-sm text-emerald-400 text-right">
        {value}
      </span>
    </div>
  );
}

export default App;
