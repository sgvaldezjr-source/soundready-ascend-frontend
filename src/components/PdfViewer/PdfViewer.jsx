import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.js?url';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { PDF_BUCKET, PDF_RESOURCES } from '../../data/pdfResources';
import './PdfViewer.css';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

const SIGNED_URL_EXPIRY_SECONDS = 300;

const PdfViewer = ({ supabase, pdfId, onBack }) => {
  const resource = PDF_RESOURCES.find((r) => r.id === pdfId);

  const [viewUrl, setViewUrl] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    if (!resource) {
      setError('Resource not found');
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setViewUrl(null);
    setDownloadUrl(null);
    setPageNumber(1);

    async function loadSignedUrls() {
      const [viewResult, downloadResult] = await Promise.all([
        supabase.storage
          .from(PDF_BUCKET)
          .createSignedUrl(resource.storagePath, SIGNED_URL_EXPIRY_SECONDS),
        supabase.storage
          .from(PDF_BUCKET)
          .createSignedUrl(resource.storagePath, SIGNED_URL_EXPIRY_SECONDS, {
            download: `${resource.title}.pdf`,
          }),
      ]);

      if (cancelled) return;

      if (viewResult.error || downloadResult.error) {
        setError(
          (viewResult.error || downloadResult.error).message ||
            'Failed to load PDF'
        );
        setLoading(false);
        return;
      }

      setViewUrl(viewResult.data.signedUrl);
      setDownloadUrl(downloadResult.data.signedUrl);
      setLoading(false);
    }

    loadSignedUrls().catch((err) => {
      if (!cancelled) {
        setError(err.message || 'Failed to load PDF');
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [supabase, resource]);

  if (loading) return <div className="pdf-loader">Loading resource...</div>;
  if (error) return <div className="pdf-error">Error: {error}</div>;
  if (!resource || !viewUrl) return <div className="pdf-error">Resource not found</div>;

  return (
    <div className="pdf-viewer">
      <header className="pdf-viewer-header">
        <button className="btn-secondary" onClick={onBack}>← Back</button>
        <div className="pdf-viewer-title-block">
          <h1 className="pdf-viewer-title">{resource.title}</h1>
          <p className="pdf-viewer-description">{resource.description}</p>
        </div>
        <a
          className="btn-primary pdf-download-button"
          href={downloadUrl}
          download={`${resource.title}.pdf`}
        >
          Download
        </a>
      </header>

      <div className="pdf-document-container">
        <Document
          file={viewUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          onLoadError={(err) => setError(err.message || 'Failed to render PDF')}
          loading={<div className="pdf-loader">Rendering PDF...</div>}
        >
          <Page pageNumber={pageNumber} renderAnnotationLayer renderTextLayer />
        </Document>
      </div>

      {numPages && (
        <footer className="pdf-viewer-footer">
          <button
            className="btn-secondary"
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
          >
            ← Previous
          </button>
          <span className="pdf-page-indicator">
            Page {pageNumber} of {numPages}
          </span>
          <button
            className="btn-primary"
            onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
            disabled={pageNumber >= numPages}
          >
            Next →
          </button>
        </footer>
      )}
    </div>
  );
};

export default PdfViewer;
