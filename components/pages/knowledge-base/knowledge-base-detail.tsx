"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { IconArrowLeft, IconLoader, IconAlertCircle } from "@tabler/icons-react";
import { useKnowledgeBaseDetail } from "@/hooks/use-knowledge-base-detail";
import { FileUploadModal } from "./file-upload-modal";
import { UrlUploadModal } from "./url-upload-modal";
import { DocumentTable } from "./document-table";

export function KnowledgeBaseDetail() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const kbId = params.id;

  const {
    kb,
    isPageLoading,
    pageError,
    isUploading,
    fileDocuments,
    urlDocuments,
    pendingFileDocuments,
    pendingUrlDocuments,
    editingTags,
    tempTags,
    tagUpdateLoading,
    isFileUploadModalOpen,
    isUrlUploadModalOpen,
    stagedFiles,
    stagedUrls,
    fileCurrentPage,
    urlCurrentPage,
    fileTotalPages,
    urlTotalPages,
    itemsPerPage,
    allTags,
    getTagSuggestions,
    isLoadingTags,
    tagLoadError,
    fileInputRef,
    setTempTags,
    handleFileUploadModalClose,
    handleUrlUploadModalClose,
    handleFileSelect,
    handleAddUrlClick,
    handleAddUrl,
    handleStagedItemChange,
    handleRemoveStagedItem,
    handleStartFileUploads,
    handleStartUrlUploads,
    handleDeleteDocument,
    handleEditTags,
    handleCancelEdit,
    handleSaveTags,
    handleFilePageChange,
    handleUrlPageChange,
    formatFileSize,
  } = useKnowledgeBaseDetail(kbId);

  if (isPageLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <IconLoader className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <IconAlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{pageError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 md:gap-6 md:p-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <IconArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="scroll-m-20 text-3xl font-bold tracking-tight">
            {kb?.name}
          </h1>
          <span className="italic font-light text-sm text-muted-foreground">
            ID: {kbId}
          </span>
        </div>
      </div>
      <Separator />

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isFileUploadModalOpen}
        onOpenChange={handleFileUploadModalClose}
        stagedFiles={stagedFiles}
        onStagedItemChange={handleStagedItemChange}
        onRemoveStagedItem={handleRemoveStagedItem}
        onStartFileUploads={handleStartFileUploads}
        isUploading={isUploading}
        allTags={allTags}
        getTagSuggestions={getTagSuggestions}
        isLoadingTags={isLoadingTags}
        tagLoadError={tagLoadError}
      />

      {/* URL Upload Modal */}
      <UrlUploadModal
        isOpen={isUrlUploadModalOpen}
        onOpenChange={handleUrlUploadModalClose}
        stagedUrls={stagedUrls}
        onStagedItemChange={handleStagedItemChange}
        onRemoveStagedItem={handleRemoveStagedItem}
        onStartUrlUploads={handleStartUrlUploads}
        onAddUrl={handleAddUrl}
        isUploading={isUploading}
        allTags={allTags}
        getTagSuggestions={getTagSuggestions}
        isLoadingTags={isLoadingTags}
        tagLoadError={tagLoadError}
      />

      <Tabs defaultValue="file">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file">Tập tin</TabsTrigger>
          <TabsTrigger value="url">URLs</TabsTrigger>
        </TabsList>

        <TabsContent
          value="file"
          className="flex flex-col gap-4 md:gap-6 mt-4"
        >
          <div className="flex justify-end">
            <div className="relative">
              <Button asChild variant="default" disabled={isUploading}>
                <label htmlFor="file-upload">
                  {isUploading ? (
                    <>
                      <IconLoader className="mr-2 h-4 w-4 animate-spin" /> In
Đang xử lý...
                    </>
                  ) : (
"Tải lên tập tin"
                  )}
                </label>
              </Button>
              <Input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                className="hidden"
                multiple
                onChange={handleFileSelect}
                disabled={isUploading}
              />
            </div>
          </div>
          <DocumentTable
            documents={fileDocuments}
            pendingUploads={pendingFileDocuments}
            onDeleteDocument={handleDeleteDocument}
            onEditTags={handleEditTags}
            onCancelEdit={handleCancelEdit}
            onSaveTags={handleSaveTags}
            editingTags={editingTags}
            tempTags={tempTags}
            tagUpdateLoading={tagUpdateLoading}
            setTempTags={setTempTags}
            currentPage={fileCurrentPage}
            totalPages={fileTotalPages}
            onPageChange={handleFilePageChange}
            itemsPerPage={itemsPerPage}
          />
        </TabsContent>

        <TabsContent
          value="url"
          className="flex flex-col gap-4 md:gap-6 mt-4"
        >
          <div className="flex justify-end">
            <Button
              variant="default"
              onClick={handleAddUrlClick}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <IconLoader className="mr-2 h-4 w-4 animate-spin" /> In
                  Progress...
                </>
              ) : (
                "Add URL"
              )}
            </Button>
          </div>
          <DocumentTable
            documents={urlDocuments}
            pendingUploads={pendingUrlDocuments}
            onDeleteDocument={handleDeleteDocument}
            onEditTags={handleEditTags}
            onCancelEdit={handleCancelEdit}
            onSaveTags={handleSaveTags}
            editingTags={editingTags}
            tempTags={tempTags}
            tagUpdateLoading={tagUpdateLoading}
            setTempTags={setTempTags}
            currentPage={urlCurrentPage}
            totalPages={urlTotalPages}
            onPageChange={handleUrlPageChange}
            itemsPerPage={itemsPerPage}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 