import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import RosTemplate from "./rosTemplate";
import Scene from "./scene";


const root = document.getElementById("app");


function Root() {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  // Initialize from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    if (mode === 'rosTemplate' || mode === 'scene') {
      setSelectedComponent(mode);
    }
  }, []);

  // Update URL when mode changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (selectedComponent) {
      params.set('mode', selectedComponent);
    } else {
      params.delete('mode');
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }, [selectedComponent]);

  if (selectedComponent === "rosTemplate") {
    return (
      <div>
        <div style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          zIndex: 10
        }}>
          <button
            onClick={() => setSelectedComponent(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            ← 返回选择
          </button>
        </div>
        <div style={{
          paddingTop: '2rem'
        }}>
          <RosTemplate />
        </div>
      </div>
    );
  }

  if (selectedComponent === "scene") {
    return (
      <div>
        <div style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          zIndex: 10
        }}>
          <button
            onClick={() => setSelectedComponent(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            ← 返回选择
          </button>
        </div>
        <Scene />
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem'
    }}>
      <h1 style={{ color: 'var(--primary-color)', marginBottom: '2rem' }}>请选择模式</h1>
      <div style={{
        display: 'flex',
        gap: '2rem',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <div
          onClick={() => setSelectedComponent("rosTemplate")}
          style={{
            width: '280px',
            height: '200px',
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: 'var(--shadow)',
            padding: '1.5rem',
            cursor: 'pointer',
            transition: 'var(--transition)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            border: '1px solid var(--border-color)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.borderColor = 'var(--primary-color)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow)';
            e.currentTarget.style.borderColor = 'var(--border-color)';
          }}
        >
          <div style={{
            fontSize: '3rem',
            color: 'var(--primary-color)',
            marginBottom: '1rem'
          }}>
            📄
          </div>
          <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-color)' }}>调试 ROS 模板</h2>
          <p style={{ margin: 0, color: 'var(--text-color)' }}>以编辑形式调试 ROS 模版</p>
        </div>

        <div
          onClick={() => setSelectedComponent("scene")}
          style={{
            width: '280px',
            height: '200px',
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: 'var(--shadow)',
            padding: '1.5rem',
            cursor: 'pointer',
            transition: 'var(--transition)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            border: '1px solid var(--border-color)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.borderColor = 'var(--primary-color)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow)';
            e.currentTarget.style.borderColor = 'var(--border-color)';
          }}
        >
          <div style={{
            fontSize: '3rem',
            color: 'var(--primary-color)',
            marginBottom: '1rem'
          }}>
            📝
          </div>
          <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-color)' }}>场景调试</h2>
          <p style={{ margin: 0, color: 'var(--text-color)' }}>以表单形式调试场景</p>
        </div>
      </div>
    </div>
  );
}

createRoot(root).render(<Root />);
