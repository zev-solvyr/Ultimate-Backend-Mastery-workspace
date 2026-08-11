"use client";

import React, { useState, useMemo } from "react";
import { useResources } from "@/hooks/use-resources";
import type { ResourceCategory, ResourceItem, ResourceType } from "@/types";
import { openFileInNewTab, downloadFileBlob } from "@/lib/file-storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bookmark,
  Plus,
  Search,
  ExternalLink,
  Download,
  FileText,
  FileCode,
  Image as ImageIcon,
  FileSpreadsheet,
  Presentation,
  File,
  Link as LinkIcon,
  Star,
  Trash2,
  Edit,
  X,
  LayoutGrid,
  List,
  Upload,
  Tag,
  FolderPlus,
} from "lucide-react";

export default function ResourcesPage() {
  const {
    loaded,
    categories,
    resources,
    addCategory,
    renameCategory,
    deleteCategory,
    addUrlResource,
    addFileResource,
    updateResource,
    deleteResource,
    toggleFavorite,
  } = useResources();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Category Modal
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [categoryNameInput, setCategoryNameInput] = useState("");
  const [editingCategory, setEditingCategory] = useState<ResourceCategory | null>(null);

  // Add/Edit URL Modal
  const [showAddUrlModal, setShowAddUrlModal] = useState(false);
  const [urlTitle, setUrlTitle] = useState("");
  const [urlAddress, setUrlAddress] = useState("");
  const [urlDesc, setUrlDesc] = useState("");
  const [urlNotes, setUrlNotes] = useState("");
  const [urlCategory, setUrlCategory] = useState("");
  const [urlTags, setUrlTags] = useState("");

  // Add File Modal
  const [showAddFileModal, setShowAddFileModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileTitle, setFileTitle] = useState("");
  const [fileDesc, setFileDesc] = useState("");
  const [fileNotes, setFileNotes] = useState("");
  const [fileCategory, setFileCategory] = useState("");
  const [fileTags, setFileTags] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Edit Item Modal
  const [editingResource, setEditingResource] = useState<ResourceItem | null>(null);

  // Unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    resources.forEach((r) => r.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [resources]);

  // Filtered resources
  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      const matchCat = selectedCategoryId === "all" || r.categoryId === selectedCategoryId;
      const matchType = selectedType === "all" || r.type === selectedType;
      const matchFav = !onlyFavorites || r.isFavorite;
      const matchTag = !selectedTag || r.tags.includes(selectedTag);

      const q = searchQuery.toLowerCase();
      const matchSearch =
        !searchQuery ||
        r.title.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        (r.notes && r.notes.toLowerCase().includes(q)) ||
        r.tags.some((t) => t.toLowerCase().includes(q)) ||
        (r.url && r.url.toLowerCase().includes(q)) ||
        (r.fileName && r.fileName.toLowerCase().includes(q));

      return matchCat && matchType && matchFav && matchTag && matchSearch;
    });
  }, [resources, selectedCategoryId, selectedType, onlyFavorites, selectedTag, searchQuery]);

  if (!loaded) {
    return <div className="p-8 text-center text-muted-foreground">Loading resources library...</div>;
  }

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case "Link":
        return <LinkIcon className="h-4 w-4 text-cyan-400" />;
      case "PDF":
        return <FileText className="h-4 w-4 text-rose-400" />;
      case "Document":
        return <FileCode className="h-4 w-4 text-blue-400" />;
      case "Spreadsheet":
        return <FileSpreadsheet className="h-4 w-4 text-emerald-400" />;
      case "Presentation":
        return <Presentation className="h-4 w-4 text-amber-400" />;
      case "Image":
        return <ImageIcon className="h-4 w-4 text-purple-400" />;
      default:
        return <File className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryNameInput.trim()) return;
    if (editingCategory) {
      renameCategory(editingCategory.id, categoryNameInput);
      setEditingCategory(null);
    } else {
      addCategory(categoryNameInput);
      setShowAddCategory(false);
    }
    setCategoryNameInput("");
  };

  const handleCreateUrlResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlTitle.trim() || !urlAddress.trim()) return;
    addUrlResource({
      title: urlTitle.trim(),
      url: urlAddress.trim(),
      description: urlDesc.trim() || undefined,
      notes: urlNotes.trim() || undefined,
      categoryId: urlCategory || (selectedCategoryId !== "all" ? selectedCategoryId : categories[0]?.id || "java"),
      tags: urlTags.split(",").map((s) => s.trim()).filter(Boolean),
      type: "Link",
    });
    setUrlTitle("");
    setUrlAddress("");
    setUrlDesc("");
    setUrlNotes("");
    setUrlTags("");
    setShowAddUrlModal(false);
  };

  const handleFileUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      await addFileResource(selectedFile, {
        title: fileTitle.trim() || selectedFile.name,
        description: fileDesc.trim() || undefined,
        notes: fileNotes.trim() || undefined,
        categoryId: fileCategory || (selectedCategoryId !== "all" ? selectedCategoryId : categories[0]?.id || "java"),
        tags: fileTags.split(",").map((s) => s.trim()).filter(Boolean),
      });
      setSelectedFile(null);
      setFileTitle("");
      setFileDesc("");
      setFileNotes("");
      setFileTags("");
      setShowAddFileModal(false);
    } catch (err) {
      alert("Failed to upload file to browser storage.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveEditResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource || !urlTitle.trim()) return;
    updateResource(editingResource.id, {
      title: urlTitle.trim(),
      description: urlDesc.trim() || undefined,
      notes: urlNotes.trim() || undefined,
      url: editingResource.type === "Link" ? urlAddress.trim() : undefined,
      categoryId: urlCategory,
      tags: urlTags.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setEditingResource(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bookmark className="h-6 w-6 text-primary" /> Personal Resources Library
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Save articles, documentation URLs, and upload PDFs, Word docs, and study materials into browser storage.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={() => {
              setUrlCategory(selectedCategoryId !== "all" ? selectedCategoryId : categories[0]?.id || "java");
              setUrlTitle("");
              setUrlAddress("");
              setUrlDesc("");
              setUrlNotes("");
              setUrlTags("");
              setShowAddUrlModal(true);
            }}
            className="gap-1.5 text-xs"
          >
            <Plus className="h-4 w-4" /> Add Link
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setFileCategory(selectedCategoryId !== "all" ? selectedCategoryId : categories[0]?.id || "java");
              setSelectedFile(null);
              setFileTitle("");
              setFileDesc("");
              setFileNotes("");
              setFileTags("");
              setShowAddFileModal(true);
            }}
            className="gap-1.5 text-xs"
          >
            <Upload className="h-3.5 w-3.5" /> Upload File
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setCategoryNameInput("");
              setShowAddCategory(true);
            }}
            className="gap-1.5 text-xs"
          >
            <FolderPlus className="h-3.5 w-3.5" /> Add Category
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Left Category Sidebar */}
        <Card className="lg:col-span-1 border-border/50 h-fit">
          <CardHeader className="pb-3 border-b border-border/30">
            <CardTitle className="text-sm font-bold">Categories ({categories.length})</CardTitle>
          </CardHeader>
          <CardContent className="pt-3 px-2 space-y-1 max-h-[600px] overflow-y-auto">
            <button
              onClick={() => setSelectedCategoryId("all")}
              className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                selectedCategoryId === "all" ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <span>All Resources</span>
              <Badge variant="secondary" className="text-[10px]">
                {resources.length}
              </Badge>
            </button>

            {categories.map((c) => {
              const rCount = resources.filter((r) => r.categoryId === c.id).length;
              const isSelected = selectedCategoryId === c.id;
              return (
                <div key={c.id} className="group relative flex items-center justify-between">
                  <button
                    onClick={() => setSelectedCategoryId(c.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between transition-colors pr-12 ${
                      isSelected ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {rCount}
                    </Badge>
                  </button>
                  <div className="absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-card px-1">
                    <button
                      onClick={() => {
                        setEditingCategory(c);
                        setCategoryNameInput(c.name);
                      }}
                      className="p-1 text-muted-foreground hover:text-foreground"
                      title="Rename Category"
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete category "${c.name}"? Resources will be moved to 'Other'.`)) {
                          deleteCategory(c.id);
                          if (selectedCategoryId === c.id) setSelectedCategoryId("all");
                        }
                      }}
                      className="p-1 text-muted-foreground hover:text-destructive"
                      title="Delete Category"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Right Library Content Workspace */}
        <div className="lg:col-span-3 space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-card p-3 rounded-lg border border-border/50">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search resources, URLs, filenames, notes, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="h-8 px-2 border rounded-md bg-background text-foreground text-xs"
              >
                <option value="all">All Types</option>
                <option value="Link">Link</option>
                <option value="PDF">PDF</option>
                <option value="Document">Document</option>
                <option value="Spreadsheet">Spreadsheet</option>
                <option value="Presentation">Presentation</option>
                <option value="Image">Image</option>
                <option value="Other">Other</option>
              </select>

              <Button
                size="sm"
                variant={onlyFavorites ? "default" : "outline"}
                className="h-8 gap-1 text-xs"
                onClick={() => setOnlyFavorites(!onlyFavorites)}
              >
                <Star className={`h-3.5 w-3.5 ${onlyFavorites ? "fill-current" : ""}`} /> Starred
              </Button>

              <div className="flex items-center border rounded-md p-0.5 bg-muted/20">
                <Button
                  size="icon"
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  className="h-7 w-7"
                  onClick={() => setViewMode("grid")}
                  title="Grid View"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  className="h-7 w-7"
                  onClick={() => setViewMode("list")}
                  title="List View"
                >
                  <List className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Tags Pills */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                <Tag className="h-3 w-3" /> Filter Tag:
              </span>
              {allTags.slice(0, 15).map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  className="cursor-pointer text-[10px]"
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                >
                  {tag}
                </Badge>
              ))}
              {selectedTag && (
                <Button size="sm" variant="ghost" onClick={() => setSelectedTag(null)} className="h-5 text-[10px] px-1 text-muted-foreground">
                  Clear
                </Button>
              )}
            </div>
          )}

          {/* Result Count Header */}
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-base font-bold text-foreground">
              {selectedCategoryId === "all" ? "All Resources" : categories.find((c) => c.id === selectedCategoryId)?.name}
            </h2>
            <span className="text-xs text-muted-foreground">{filteredResources.length} items</span>
          </div>

          {/* Resource Grid / List */}
          {filteredResources.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <p className="text-sm text-muted-foreground">No resources found matching your filters.</p>
              <div className="flex justify-center gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={() => {
                    setUrlCategory(selectedCategoryId !== "all" ? selectedCategoryId : categories[0]?.id || "java");
                    setShowAddUrlModal(true);
                  }}
                  className="text-xs gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Add First Link
                </Button>
              </div>
            </Card>
          ) : viewMode === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
              {filteredResources.map((item) => {
                const catObj = categories.find((c) => c.id === item.categoryId);

                return (
                  <Card key={item.id} className="border-border/50 hover:border-border transition-colors flex flex-col justify-between">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-md bg-muted/30 border border-border/40">{getResourceIcon(item.type)}</div>
                          <div>
                            <CardTitle className="text-sm font-bold leading-tight">{item.title}</CardTitle>
                            <span className="text-[10px] text-muted-foreground block mt-0.5">
                              {catObj?.name || item.categoryId} • {item.type} {item.fileSize ? `(${formatFileSize(item.fileSize)})` : ""}
                            </span>
                          </div>
                        </div>

                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-muted-foreground hover:text-amber-400"
                          onClick={() => toggleFavorite(item.id)}
                          title={item.isFavorite ? "Unstar" : "Star"}
                        >
                          <Star className={`h-4 w-4 ${item.isFavorite ? "fill-amber-400 text-amber-400" : ""}`} />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3 pt-1 text-xs">
                      {item.description && <p className="text-muted-foreground leading-relaxed line-clamp-2">{item.description}</p>}

                      {item.notes && (
                        <div className="bg-muted/20 p-2 rounded border border-border/30 text-[11px] text-foreground/80 font-mono line-clamp-2">
                          {item.notes}
                        </div>
                      )}

                      {item.tags.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {item.tags.map((tag, tIdx) => (
                            <Badge key={tIdx} variant="outline" className="text-[9px] font-mono">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Card Actions */}
                      <div className="pt-2 border-t border-border/30 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {item.type === "Link" && item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                            >
                              <ExternalLink className="h-3.5 w-3.5" /> Open Link
                            </a>
                          )}

                          {item.storedFileId && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[11px] gap-1"
                                onClick={() => openFileInNewTab(item.storedFileId!)}
                              >
                                <ExternalLink className="h-3 w-3" /> View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[11px] gap-1"
                                onClick={() => downloadFileBlob(item.storedFileId!, item.fileName)}
                              >
                                <Download className="h-3 w-3" /> Download
                              </Button>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              setEditingResource(item);
                              setUrlTitle(item.title);
                              setUrlDesc(item.description || "");
                              setUrlNotes(item.notes || "");
                              setUrlAddress(item.url || "");
                              setUrlCategory(item.categoryId);
                              setUrlTags(item.tags.join(", "));
                            }}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              if (confirm("Delete this resource?")) deleteResource(item.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* List View */
            <Card className="border-border/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 text-muted-foreground border-b border-border/40">
                    <tr>
                      <th className="p-3 font-semibold">Title & Type</th>
                      <th className="p-3 font-semibold">Category</th>
                      <th className="p-3 font-semibold">Tags</th>
                      <th className="p-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filteredResources.map((item) => {
                      const catObj = categories.find((c) => c.id === item.categoryId);

                      return (
                        <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                          <td className="p-3 font-medium">
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 shrink-0"
                                onClick={() => toggleFavorite(item.id)}
                              >
                                <Star className={`h-3.5 w-3.5 ${item.isFavorite ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                              </Button>
                              <div className="shrink-0">{getResourceIcon(item.type)}</div>
                              <div>
                                <p className="font-bold text-foreground">{item.title}</p>
                                {item.description && <p className="text-[11px] text-muted-foreground line-clamp-1">{item.description}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-muted-foreground">{catObj?.name || item.categoryId}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-1 flex-wrap">
                              {item.tags.map((t, idx) => (
                                <Badge key={idx} variant="outline" className="text-[9px]">
                                  #{t}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {item.type === "Link" && item.url && (
                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-primary hover:bg-primary/10 rounded">
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              )}
                              {item.storedFileId && (
                                <>
                                  <button onClick={() => openFileInNewTab(item.storedFileId!)} className="p-1.5 text-primary hover:bg-primary/10 rounded" title="View File">
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </button>
                                  <button onClick={() => downloadFileBlob(item.storedFileId!, item.fileName)} className="p-1.5 text-emerald-400 hover:bg-emerald-400/10 rounded" title="Download File">
                                    <Download className="h-3.5 w-3.5" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => {
                                  setEditingResource(item);
                                  setUrlTitle(item.title);
                                  setUrlDesc(item.description || "");
                                  setUrlNotes(item.notes || "");
                                  setUrlAddress(item.url || "");
                                  setUrlCategory(item.categoryId);
                                  setUrlTags(item.tags.join(", "));
                                }}
                                className="p-1.5 text-muted-foreground hover:text-foreground rounded"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => deleteResource(item.id)} className="p-1.5 text-muted-foreground hover:text-destructive rounded">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Modal: Category Add/Edit */}
      {(showAddCategory || editingCategory) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">{editingCategory ? "Edit Category" : "Add Resource Category"}</h3>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { setShowAddCategory(false); setEditingCategory(null); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Java 21, Spring Security, Kafka"
                  value={categoryNameInput}
                  onChange={(e) => setCategoryNameInput(e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 border rounded-md bg-background text-foreground text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => { setShowAddCategory(false); setEditingCategory(null); }}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  {editingCategory ? "Save Changes" : "Create Category"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal: Add/Edit URL Resource */}
      {(showAddUrlModal || editingResource) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <Card className="w-full max-w-lg p-4 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">{editingResource ? "Edit Resource" : "Add Web Link Resource"}</h3>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { setShowAddUrlModal(false); setEditingResource(null); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={editingResource ? handleSaveEditResource : handleCreateUrlResource} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold">Title</label>
                <input
                  type="text"
                  required
                  placeholder="Resource title"
                  value={urlTitle}
                  onChange={(e) => setUrlTitle(e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 border rounded-md bg-background text-foreground text-xs"
                />
              </div>

              {(!editingResource || editingResource.type === "Link") && (
                <div>
                  <label className="font-semibold">URL Address</label>
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={urlAddress}
                    onChange={(e) => setUrlAddress(e.target.value)}
                    className="mt-1 w-full px-3 py-1.5 border rounded-md bg-background text-foreground text-xs font-mono"
                  />
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="font-semibold">Category</label>
                  <select
                    value={urlCategory}
                    onChange={(e) => setUrlCategory(e.target.value)}
                    className="mt-1 w-full px-3 py-1.5 border rounded-md bg-background text-foreground text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold">Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="documentation, java, guide"
                    value={urlTags}
                    onChange={(e) => setUrlTags(e.target.value)}
                    className="mt-1 w-full px-3 py-1.5 border rounded-md bg-background text-foreground text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold">Short Description</label>
                <input
                  type="text"
                  placeholder="Summary of what this resource covers"
                  value={urlDesc}
                  onChange={(e) => setUrlDesc(e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 border rounded-md bg-background text-foreground text-xs"
                />
              </div>

              <div>
                <label className="font-semibold">Personal Notes</label>
                <textarea
                  placeholder="Key takeaways or study notes..."
                  value={urlNotes}
                  onChange={(e) => setUrlNotes(e.target.value)}
                  className="mt-1 w-full p-2 border rounded-md bg-background text-foreground text-xs min-h-[80px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => { setShowAddUrlModal(false); setEditingResource(null); }}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  {editingResource ? "Save Changes" : "Add Link Resource"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal: Upload File Resource */}
      {showAddFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <Card className="w-full max-w-lg p-4 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Upload File Resource</h3>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setShowAddFileModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleFileUploadSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold">Select File (PDF, Image, Doc, Sheet, PPT)</label>
                <input
                  type="file"
                  required
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setSelectedFile(f);
                      if (!fileTitle) setFileTitle(f.name);
                    }
                  }}
                  className="mt-1 w-full p-1.5 border rounded-md bg-background text-foreground text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-primary/10 file:text-primary"
                />
              </div>

              <div>
                <label className="font-semibold">Title</label>
                <input
                  type="text"
                  required
                  placeholder="Resource title"
                  value={fileTitle}
                  onChange={(e) => setFileTitle(e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 border rounded-md bg-background text-foreground text-xs"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="font-semibold">Category</label>
                  <select
                    value={fileCategory}
                    onChange={(e) => setFileCategory(e.target.value)}
                    className="mt-1 w-full px-3 py-1.5 border rounded-md bg-background text-foreground text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold">Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="pdf, notes, interview"
                    value={fileTags}
                    onChange={(e) => setFileTags(e.target.value)}
                    className="mt-1 w-full px-3 py-1.5 border rounded-md bg-background text-foreground text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold">Short Description</label>
                <input
                  type="text"
                  placeholder="Summary of file contents"
                  value={fileDesc}
                  onChange={(e) => setFileDesc(e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 border rounded-md bg-background text-foreground text-xs"
                />
              </div>

              <div>
                <label className="font-semibold">Personal Notes</label>
                <textarea
                  placeholder="Key takeaways from this document..."
                  value={fileNotes}
                  onChange={(e) => setFileNotes(e.target.value)}
                  className="mt-1 w-full p-2 border rounded-md bg-background text-foreground text-xs min-h-[80px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddFileModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isUploading}>
                  {isUploading ? "Uploading..." : "Upload & Save File"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
