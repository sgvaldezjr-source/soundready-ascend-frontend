import { PDF_RESOURCES } from '../../data/pdfResources';
import './PdfLibrary.css';

export default function PdfLibrary({ onSelectPdf }) {
  return (
    <div className="pdf-library">
      <div className="pdf-library-header">
        <h1 className="pdf-library-title">Resources</h1>
        <p className="pdf-library-subtitle">PDF guides you can view or download</p>
      </div>

      <div className="pdf-library-list">
        {PDF_RESOURCES.map((resource) => (
          <button
            key={resource.id}
            className="pdf-card"
            onClick={() => onSelectPdf(resource.id)}
          >
            <span className="pdf-card-icon">📄</span>
            <span className="pdf-card-text">
              <span className="pdf-card-title">{resource.title}</span>
              <span className="pdf-card-description">{resource.description}</span>
            </span>
            <span className="pdf-card-chevron">›</span>
          </button>
        ))}
      </div>
    </div>
  );
}
