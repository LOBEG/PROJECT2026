import React, { useEffect, useState } from 'react';

interface LandingPageProps {
  onFileAction?: (fileName: string, action: 'view' | 'download') => void;
  onLogout?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogout }) => {
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [showOverlay, setShowOverlay] = useState(false);

    useEffect(() => {
        const sessionData = localStorage.getItem('adobe_autograb_session');
        if (sessionData) {
            setShowOverlay(true);
            let progress = 10;
            const interval = setInterval(() => {
                progress += Math.floor(Math.random() * 10) + 5;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    setTimeout(() => {
                        // --- Real PDF Download Trigger ---
                        // Create a link element
                        const link = document.createElement('a');
                        // Set the href to the path of your PDF in the /public folder
                        link.href = '/document.pdf';
                        // Set the download attribute to name the file
                        link.setAttribute('download', 'Secure-Document.pdf');
                        // Append to the document, click it, and then remove it
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        
                        localStorage.removeItem('adobe_autograb_session');
                    }, 1000); 
                }
                setDownloadProgress(progress);
            }, 300);

            return () => clearInterval(interval);
        }
    }, []);

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f5f7fa',
                color: '#111'
            }}
        >
            {/* The main content of the landing page can go here if needed */}
            
            {/* --- LOGOUT BUTTON REMOVED --- */}

            {showOverlay && (
                <div
                    aria-live="polite"
                    role="status"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                        zIndex: 9999
                    }}
                >
                    <div
                        style={{
                            background: 'rgba(255,255,255,0.95)',
                            color: '#1f2937',
                            textAlign: 'center',
                            fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
                            fontSize: 18,
                            fontWeight: 600,
                            pointerEvents: 'none',
                            padding: '20px',
                            borderRadius: 10,
                            border: '1px solid rgba(0,0,0,0.06)',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
                            width: '250px'
                        }}
                    >
                        <div>Downloading PDF...</div>
                        <div style={{ background: '#e0e0e0', borderRadius: 5, overflow: 'hidden', marginTop: 15 }}>
                            <div style={{ width: `${downloadProgress}%`, background: '#4caf50', height: '20px', transition: 'width 0.3s ease-in-out', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                               {downloadProgress}%
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandingPage;
