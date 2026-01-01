import { useState, useMemo } from "react";
import {
  FileText,
  Plus,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Search,
  Pencil,
  Trash2,
  Star,
  FolderOpen,
  FolderPlus,
  FilePlus,
  Folder,
  FolderInput,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useFiles, useCreateFile, useDeleteFile, usePatchFile } from "../hooks/useFiles";
import { useFolders, useCreateFolder, useRenameFolder, useDeleteFolder } from "../hooks/useFolders";
import { cn } from "@/lib/utils";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import type { File, Folder as FolderType } from "../../shared/types";

type DialogMode = 
  | { type: "none" }
  | { type: "deleteFile"; file: File }
  | { type: "renameFile"; file: File }
  | { type: "deleteFolder"; folder: FolderType }
  | { type: "renameFolder"; folder: FolderType }
  | { type: "createFolder" }
  | { type: "createFileInFolder"; folderId: number | null };

export function FilesSidebar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Record<number | string, boolean>>({
    favorites: true,
    uncategorized: true,
  });
  const [dialog, setDialog] = useState<DialogMode>({ type: "none" });
  const [inputValue, setInputValue] = useState("");
  
  const [searchParams] = useSearchParams();
  const activeFileId = searchParams.get("fileId");
  const navigate = useNavigate();
  
  // Data fetching
  const { data: files, isLoading: filesLoading } = useFiles();
  const { data: folders, isLoading: foldersLoading } = useFolders();
  
  // File mutations
  const createFileMutation = useCreateFile();
  const deleteFileMutation = useDeleteFile();
  const patchFileMutation = usePatchFile();
  
  // Folder mutations
  const createFolderMutation = useCreateFolder();
  const renameFolderMutation = useRenameFolder();
  const deleteFolderMutation = useDeleteFolder();

  const isLoading = filesLoading || foldersLoading;

  const toggleFolder = (id: number | string) => {
    setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // File handlers
  const handleCreateFile = async (folderId: number | null = null) => {
    const name = `Query ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
    try {
      const newFile = await createFileMutation.mutateAsync({
        name,
        content: "-- New Query\nSELECT * FROM ",
        folderId,
      });
      navigate(`/?fileId=${newFile.id}`);
    } catch (e) {
      console.error("Failed to create file", e);
    }
  };

  const handleDeleteFile = async () => {
    if (dialog.type !== "deleteFile") return;
    try {
      await deleteFileMutation.mutateAsync(dialog.file.id);
      setDialog({ type: "none" });
    } catch (e) {
      console.error("Failed to delete file", e);
    }
  };

  const handleRenameFile = async () => {
    if (dialog.type !== "renameFile" || !inputValue.trim()) return;
    try {
      await patchFileMutation.mutateAsync({ id: dialog.file.id, name: inputValue.trim() });
      setDialog({ type: "none" });
    } catch (e) {
      console.error("Failed to rename file", e);
    }
  };

  const handleToggleFavorite = async (file: File) => {
    try {
      await patchFileMutation.mutateAsync({ id: file.id, isFavorite: !file.isFavorite });
    } catch (e) {
      console.error("Failed to toggle favorite", e);
    }
  };

  // Folder handlers
  const handleCreateFolder = async () => {
    if (!inputValue.trim()) return;
    try {
      await createFolderMutation.mutateAsync({ name: inputValue.trim() });
      setDialog({ type: "none" });
      setInputValue("");
    } catch (e) {
      console.error("Failed to create folder", e);
    }
  };

  const handleRenameFolder = async () => {
    if (dialog.type !== "renameFolder" || !inputValue.trim()) return;
    try {
      await renameFolderMutation.mutateAsync({ id: dialog.folder.id, name: inputValue.trim() });
      setDialog({ type: "none" });
    } catch (e) {
      console.error("Failed to rename folder", e);
    }
  };

  const handleDeleteFolder = async () => {
    if (dialog.type !== "deleteFolder") return;
    try {
      await deleteFolderMutation.mutateAsync(dialog.folder.id);
      setDialog({ type: "none" });
    } catch (e) {
      console.error("Failed to delete folder", e);
    }
  };

  const openDialog = (mode: DialogMode) => {
    setDialog(mode);
    if (mode.type === "renameFile") setInputValue(mode.file.name);
    else if (mode.type === "renameFolder") setInputValue(mode.folder.name);
    else setInputValue("");
  };

  // Organize data
  const { favorites, folderGroups, uncategorized } = useMemo(() => {
    if (!files) return { favorites: [], folderGroups: [], uncategorized: [] };
    
    const filtered = searchQuery
      ? files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : files;
    
    const favs = filtered.filter(f => f.isFavorite);
    const uncat = filtered.filter(f => !f.folderId);
    
    const groups = (folders || []).map(folder => ({
      folder,
      files: filtered.filter(f => f.folderId === folder.id),
    }));

    return { favorites: favs, folderGroups: groups, uncategorized: uncat };
  }, [files, folders, searchQuery]);

  // Components
  const FileItem = ({ file, showFavoriteIcon = false }: { file: File; showFavoriteIcon?: boolean }) => {
    const isActive = activeFileId === String(file.id);
    
    return (
      <SidebarMenuItem className="group/item relative">
        <SidebarMenuButton asChild className="pr-16">
          <Link 
            to={`/?fileId=${file.id}`}
            className={cn(
              "flex w-full items-center gap-2 px-4 py-1 text-sm transition-colors",
              isActive 
                ? "bg-accent text-accent-foreground font-medium" 
                : "text-foreground/80 hover:bg-accent/50 hover:text-foreground"
            )}
          >
            {showFavoriteIcon ? (
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
            ) : (
              <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            )}
            <span className="truncate flex-1">{file.name}</span>
          </Link>
        </SidebarMenuButton>
        
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={(e) => { e.preventDefault(); handleToggleFavorite(file); }}
                className={cn(
                  "p-1 rounded hover:bg-accent transition-colors",
                  file.isFavorite ? "text-amber-400" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Star className={cn("h-3.5 w-3.5", file.isFavorite && "fill-current")} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {file.isFavorite ? "Remove from favorites" : "Add to favorites"}
            </TooltipContent>
          </Tooltip>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => openDialog({ type: "renameFile", file })}>
                <Pencil className="h-3.5 w-3.5 mr-2" />
                Rename
              </DropdownMenuItem>
              {folders && folders.length > 0 && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <FolderInput className="h-3.5 w-3.5 mr-2" />
                    Move to
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {file.folderId && (
                      <DropdownMenuItem onClick={() => patchFileMutation.mutate({ id: file.id, folderId: null })}>
                        <FileText className="h-3.5 w-3.5 mr-2" />
                        Uncategorized
                      </DropdownMenuItem>
                    )}
                    {folders.filter(f => f.id !== file.folderId).map(folder => (
                      <DropdownMenuItem 
                        key={folder.id} 
                        onClick={() => patchFileMutation.mutate({ id: file.id, folderId: folder.id })}
                      >
                        <FolderOpen className="h-3.5 w-3.5 mr-2" />
                        {folder.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => openDialog({ type: "deleteFile", file })}
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarMenuItem>
    );
  };

  const FolderSection = ({ folder, files: folderFiles }: { folder: FolderType; files: File[] }) => {
    const isExpanded = expandedFolders[folder.id] ?? true;
    
    return (
      <SidebarGroup>
        <div className="group/folder flex items-center">
          <button
            onClick={() => toggleFolder(folder.id)}
            className="flex flex-1 items-center gap-1.5 px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            <FolderOpen className="h-3 w-3" />
            <span className="truncate">{folder.name}</span>
            <span className="ml-auto text-[10px] opacity-60 mr-6">{folderFiles.length}</span>
          </button>
          
          <div className="opacity-0 group-hover/folder:opacity-100 transition-opacity flex items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => handleCreateFile(folder.id)}
                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <FilePlus className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">New file in folder</TooltipContent>
            </Tooltip>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                  <MoreHorizontal className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={() => openDialog({ type: "renameFolder", folder })}>
                  <Pencil className="h-3.5 w-3.5 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={() => openDialog({ type: "deleteFolder", folder })}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {isExpanded && folderFiles.length > 0 && (
          <SidebarGroupContent className="mt-1">
            <SidebarMenu>
              {folderFiles.map((file) => (
                <FileItem key={file.id} file={file} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        )}
      </SidebarGroup>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center justify-between px-3 border-b border-border">
        <span className="text-sm font-semibold">Files</span>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Plus className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => handleCreateFile(null)}>
              <FilePlus className="h-4 w-4 mr-2" />
              New File
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openDialog({ type: "createFolder" })}>
              <FolderPlus className="h-4 w-4 mr-2" />
              New Folder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Search */}
      <div className="h-9 border-b border-border">
        <div className="relative h-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-8 text-sm bg-transparent border-0 focus-visible:ring-0 rounded-none placeholder:text-muted-foreground/70"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto py-2">
        {isLoading ? (
          <div className="px-3 py-4 text-sm text-muted-foreground text-center">Loading...</div>
        ) : (files?.length === 0 && folders?.length === 0) ? (
          <div className="px-3 py-8 text-center">
            <Folder className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No files or folders yet</p>
            <div className="flex gap-2 justify-center mt-2">
              <Button variant="outline" size="sm" onClick={() => handleCreateFile(null)}>
                <FilePlus className="h-3.5 w-3.5 mr-1" />
                New File
              </Button>
              <Button variant="outline" size="sm" onClick={() => openDialog({ type: "createFolder" })}>
                <FolderPlus className="h-3.5 w-3.5 mr-1" />
                New Folder
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Favorites */}
            {favorites.length > 0 && (
              <SidebarGroup>
                <button
                  onClick={() => toggleFolder("favorites")}
                  className="flex w-full items-center gap-1.5 px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {expandedFolders.favorites ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  <Star className="h-3 w-3" />
                  <span>FAVORITES</span>
                  <span className="ml-auto text-[10px] opacity-60">{favorites.length}</span>
                </button>
                
                {expandedFolders.favorites && (
                  <SidebarGroupContent className="mt-1">
                    <SidebarMenu>
                      {favorites.map((file) => (
                        <FileItem key={`fav-${file.id}`} file={file} showFavoriteIcon />
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                )}
              </SidebarGroup>
            )}

            {/* Folders */}
            {folderGroups.map(({ folder, files: folderFiles }) => (
              <FolderSection key={folder.id} folder={folder} files={folderFiles} />
            ))}

            {/* Uncategorized */}
            {uncategorized.length > 0 && (
              <SidebarGroup>
                <button
                  onClick={() => toggleFolder("uncategorized")}
                  className="flex w-full items-center gap-1.5 px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {expandedFolders.uncategorized ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  <FileText className="h-3 w-3" />
                  <span>UNCATEGORIZED</span>
                  <span className="ml-auto text-[10px] opacity-60">{uncategorized.length}</span>
                </button>
                
                {expandedFolders.uncategorized && (
                  <SidebarGroupContent className="mt-1">
                    <SidebarMenu>
                      {uncategorized.map((file) => (
                        <FileItem key={file.id} file={file} />
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                )}
              </SidebarGroup>
            )}
          </>
        )}
      </div>

      {/* Delete File Dialog */}
      <Dialog open={dialog.type === "deleteFile"} onOpenChange={(open) => !open && setDialog({ type: "none" })}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete file</DialogTitle>
            <DialogDescription>
              Delete <span className="font-medium text-foreground">"{dialog.type === "deleteFile" ? dialog.file.name : ""}"</span>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialog({ type: "none" })}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteFile} disabled={deleteFileMutation.isPending}>
              {deleteFileMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename File Dialog */}
      <Dialog open={dialog.type === "renameFile"} onOpenChange={(open) => !open && setDialog({ type: "none" })}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Rename file</DialogTitle>
          </DialogHeader>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="File name"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleRenameFile()}
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialog({ type: "none" })}>Cancel</Button>
            <Button onClick={handleRenameFile} disabled={!inputValue.trim() || patchFileMutation.isPending}>
              {patchFileMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Folder Dialog */}
      <Dialog open={dialog.type === "createFolder"} onOpenChange={(open) => !open && setDialog({ type: "none" })}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>New folder</DialogTitle>
          </DialogHeader>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Folder name"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialog({ type: "none" })}>Cancel</Button>
            <Button onClick={handleCreateFolder} disabled={!inputValue.trim() || createFolderMutation.isPending}>
              {createFolderMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Folder Dialog */}
      <Dialog open={dialog.type === "renameFolder"} onOpenChange={(open) => !open && setDialog({ type: "none" })}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Rename folder</DialogTitle>
          </DialogHeader>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Folder name"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleRenameFolder()}
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialog({ type: "none" })}>Cancel</Button>
            <Button onClick={handleRenameFolder} disabled={!inputValue.trim() || renameFolderMutation.isPending}>
              {renameFolderMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Dialog */}
      <Dialog open={dialog.type === "deleteFolder"} onOpenChange={(open) => !open && setDialog({ type: "none" })}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete folder</DialogTitle>
            <DialogDescription>
              Delete <span className="font-medium text-foreground">"{dialog.type === "deleteFolder" ? dialog.folder.name : ""}"</span> and all its files? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialog({ type: "none" })}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteFolder} disabled={deleteFolderMutation.isPending}>
              {deleteFolderMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


