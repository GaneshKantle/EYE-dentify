import React from 'react';

const Sketch = () => {
  return (
    <div className="sketch-page">
      <div className="sketch-header">
        <h1>Create Suspect Sketch</h1>
        <p>Advanced sketch generation tools for forensic investigations</p>
      </div>

      <div className="sketch-content">
        <div className="sketch-placeholder">
          <div className="placeholder-icon">✏️</div>
          <h2>Sketch Generation Module</h2>
          <p>This feature is currently under development and will be available soon.</p>
          <div className="coming-soon">
            <span>Coming Soon</span>
          </div>
        </div>

        <div className="sketch-features">
          <h3>Planned Features</h3>
          <div className="features-list">
            <div className="feature-item">
              <span className="feature-icon">🎨</span>
              <span>AI-Powered Sketch Generation</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">👤</span>
              <span>Facial Feature Customization</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔍</span>
              <span>Real-time Preview</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💾</span>
              <span>Save & Export Sketches</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔄</span>
              <span>Integration with Recognition System</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sketch;
