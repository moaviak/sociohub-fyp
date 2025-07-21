export const getDocumentIcon = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "pdf":
      return (
        <img src="/assets/icons/PDF.svg" className="size-8 object-contain" />
      );
    case "doc":
      return (
        <img src="/assets/icons/DOC.svg" className="size-8 object-contain" />
      );
    case "docx":
      return (
        <img src="/assets/icons/DOCX.svg" className="size-8 object-contain" />
      );
    case "xls":
    case "xlsx":
      return (
        <img src="/assets/icons/XSL.svg" className="size-8 object-contain" />
      );
    case "ppt":
    case "pptx":
      return (
        <img src="/assets/icons/PPT.svg" className="size-8 object-contain" />
      );
    case "txt":
    case "md":
      return (
        <img src="/assets/icons/TXT.svg" className="size-8 object-contain" />
      );
    case "zip":
    case "7z":
      return (
        <img src="/assets/icons/ZIP.svg" className="size-8 object-contain" />
      );
    case "ai":
      return (
        <img src="/assets/icons/AI.svg" className="size-8 object-contain" />
      );
    case "avi":
      return (
        <img src="/assets/icons/AVI.svg" className="size-8 object-contain" />
      );
    case "bmp":
      return (
        <img src="/assets/icons/BMP.svg" className="size-8 object-contain" />
      );
    case "crd":
      return (
        <img src="/assets/icons/CRD.svg" className="size-8 object-contain" />
      );
    case "csv":
      return (
        <img src="/assets/icons/CSV.svg" className="size-8 object-contain" />
      );
    case "dll":
      return (
        <img src="/assets/icons/DLL.svg" className="size-8 object-contain" />
      );
    case "dwg":
      return (
        <img src="/assets/icons/DWG.svg" className="size-8 object-contain" />
      );
    case "eps":
      return (
        <img src="/assets/icons/EPS.svg" className="size-8 object-contain" />
      );
    case "exe":
      return (
        <img src="/assets/icons/EXE.svg" className="size-8 object-contain" />
      );
    case "flv":
      return (
        <img src="/assets/icons/FLV.svg" className="size-8 object-contain" />
      );
    case "giff":
      return (
        <img src="/assets/icons/GIFF.svg" className="size-8 object-contain" />
      );
    case "html":
      return (
        <img src="/assets/icons/HTML.svg" className="size-8 object-contain" />
      );
    case "iso":
      return (
        <img src="/assets/icons/ISO.svg" className="size-8 object-contain" />
      );
    case "java":
      return (
        <img src="/assets/icons/JAVA.svg" className="size-8 object-contain" />
      );
    case "jpg":
    case "jpeg":
      return (
        <img src="/assets/icons/JPG.svg" className="size-8 object-contain" />
      );
    case "mdb":
      return (
        <img src="/assets/icons/MDB.svg" className="size-8 object-contain" />
      );
    case "mid":
      return (
        <img src="/assets/icons/MID.svg" className="size-8 object-contain" />
      );
    case "mov":
      return (
        <img src="/assets/icons/MOV.svg" className="size-8 object-contain" />
      );
    case "mp3":
      return (
        <img src="/assets/icons/MP3.svg" className="size-8 object-contain" />
      );
    case "mp4":
      return (
        <img src="/assets/icons/MP4.svg" className="size-8 object-contain" />
      );
    case "mpeg":
      return (
        <img src="/assets/icons/MPEG.svg" className="size-8 object-contain" />
      );
    case "png":
      return (
        <img src="/assets/icons/PNG.svg" className="size-8 object-contain" />
      );
    case "ps":
      return (
        <img src="/assets/icons/PS.svg" className="size-8 object-contain" />
      );
    case "psd":
      return (
        <img src="/assets/icons/PSD.svg" className="size-8 object-contain" />
      );
    case "pub":
      return (
        <img src="/assets/icons/PUB.svg" className="size-8 object-contain" />
      );
    case "rar":
      return (
        <img src="/assets/icons/RAR.svg" className="size-8 object-contain" />
      );
    case "raw":
      return (
        <img src="/assets/icons/RAW.svg" className="size-8 object-contain" />
      );
    case "rss":
      return (
        <img src="/assets/icons/RSS.svg" className="size-8 object-contain" />
      );
    case "svg":
      return (
        <img src="/assets/icons/SVG.svg" className="size-8 object-contain" />
      );
    case "tiff":
      return (
        <img src="/assets/icons/PUB.svg" className="size-8 object-contain" />
      );
    case "wav":
      return (
        <img src="/assets/icons/WAV.svg" className="size-8 object-contain" />
      );
    case "wma":
      return (
        <img src="/assets/icons/WMA.svg" className="size-8 object-contain" />
      );
    case "xml":
      return (
        <img src="/assets/icons/XML.svg" className="size-8 object-contain" />
      );
    default:
      return (
        <img src="/assets/icons/FILE.svg" className="size-8 object-contain" />
      );
  }
};
