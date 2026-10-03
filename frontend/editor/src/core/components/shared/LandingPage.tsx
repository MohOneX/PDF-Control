import React from "react";
import { Dropzone } from "@mantine/dropzone";
import { useTranslation } from "react-i18next";
import { useFileHandler } from "@app/hooks/useFileHandler";
import { useFileActionTerminology } from "@app/hooks/useFileActionTerminology";
import { openFilesFromDisk } from "@app/services/openFilesFromDisk";
import { Logo } from "@app/ui/Logo";
import { LandingActions } from "@app/components/shared/LandingActions";
import { LandingDocumentStack } from "@app/components/shared/LandingDocumentStack";
import { LandingStarterTools } from "@app/components/shared/LandingStarterTools";
import { useDropzoneFiles } from "@app/hooks/useDropzoneFiles";
import "@app/components/shared/LandingPage.css";

const LandingPage = () => {
  const { t } = useTranslation();
  const { addFiles } = useFileHandler();
  const getDropzoneFiles = useDropzoneFiles();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const terminology = useFileActionTerminology();

  const handleFileDrop = async (files: File[]) => {
    await addFiles(files);
  };

  const handleNativeUploadClick = async () => {
    const files = await openFilesFromDisk({
      multiple: true,
      onFallbackOpen: () => fileInputRef.current?.click(),
    });
    if (files.length > 0) {
      await addFiles(files);
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      await addFiles(files);
    }
    event.target.value = "";
  };

  return (
    <div className="landing-shell">
      <div className="landing-atmosphere" aria-hidden />

      <Dropzone
        onDrop={handleFileDrop}
        multiple
        activateOnClick={false}
        useFsAccessApi={false}
        getFilesFromEvent={getDropzoneFiles}
        enablePointerEvents
        aria-label={terminology.dropFilesHere}
        className="landing-dropzone"
        styles={{
          root: {
            border: "none !important",
            backgroundColor: "transparent",
            overflow: "auto",
          },
          inner: {
            overflow: "visible",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            minHeight: "100%",
          },
        }}
      >
        <div className="landing-hero">
          <Logo
            variant="iconAndText"
            orientation="vertical"
            iconHeight="4.5rem"
            textHeight="2.25rem"
            gap="0.85rem"
            className="landing-enter landing-enter--1"
          />

          <p className="landing-developed-by landing-enter landing-enter--1">
            {t("brand.developedBy", "Developed By MohOneX")}
          </p>

          <div className="landing-visual landing-enter landing-enter--2">
            <LandingDocumentStack />
          </div>

          <h1 className="landing-title landing-enter landing-enter--3">
            {t("landing.title", "Your documents, under control")}
          </h1>

          <p className="landing-subtitle landing-enter landing-enter--3">
            {t(
              "landing.subtitle",
              "Merge, compress, sign, and convert PDFs privately — right where you are.",
            )}
          </p>

          <div className="landing-cta landing-enter landing-enter--4">
            <LandingActions
              fileInputRef={fileInputRef}
              onUploadClick={() => void handleNativeUploadClick()}
              onFileSelect={handleFileSelect}
            />
          </div>

          <div className="landing-enter landing-enter--5">
            <LandingStarterTools />
          </div>
        </div>
      </Dropzone>
    </div>
  );
};

export default LandingPage;
