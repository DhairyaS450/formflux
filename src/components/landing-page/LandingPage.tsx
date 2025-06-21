import React from 'react';
import Image from 'next/image';
import { FcGoogle } from 'react-icons/fc';
import './landing-page.scss';

interface LandingPageProps {
  handleSignIn: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ handleSignIn }) => {
  return (
    <div className="landing-container">
      <main className="landing-main">
        <div className="hero-section">
          <h1>Your Personal AI Fitness Coach</h1>
          <div className="features-list">
            <div className="feature-item">
              <span className="feature-icon">🎙️</span>
              <span>Real-time audio</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📸</span>
              <span>Visual Output</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎵</span>
              <span>Customization</span>
            </div>
          </div>
        </div>
        
        <div className="cta-section">
          <button onClick={handleSignIn} className="google-signin-button">
            <FcGoogle className="google-icon" />
            <span>Login With Google</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
