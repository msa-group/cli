import React, { useEffect, useState, useRef } from "react";
import jsYaml from "js-yaml";

import CodeMirror from "@uiw/react-codemirror";
import { yaml } from "@codemirror/lang-yaml";
import { json } from "@codemirror/lang-json";
import { materialDark } from "@uiw/codemirror-theme-material";
import MseEngine from "msa-engine";
import { components, getSpecs } from "msa-spec";

const engine = new MseEngine();

interface MsaTemplate {
  Name: string;
  UpdatedAt: string;
  Score: number;
  Status: string;
  Category: string;
  Content: {
    Parameters: {
      Region: string;
      Name: string;
    },
    SceneMetadata: {
      Name: {
        "zh-cn": string;
        "en": string;
      },
      Description: {
        "zh-cn": string;
        "en": string;
      },
      Logo: string;
    },
    SceneProfiles: {
      DisplayName: {
        "zh-cn": string;
        "en": string;
      },
      Template: string;
      Documentation: {
        "zh-cn": string;
        "en": string;
      },
      Parameters: {
        Backend: {
          Cpu: number;
          Memory: number;
        }
      },
      Spec: {
        Backend: string;
      }
    }[]
  }
}

function RosTemplate() {

  const [msaYaml, setMsaYaml] = useState("");
  const [currentScenceProfile, setCurrentScenceProfile] = useState(null);
  const [globalParameters, setGlobalParameters] = useState({});
  const [rosYaml, setRosYaml] = useState("");
  const [config, setConfig] = useState({ SceneProfiles: [] });
  const [arch, setArch] = useState("");
  const [openMenu, setOpenMenu] = useState(false);
  const [msaTemplates, setMsaTemplates] = useState<MsaTemplate[]>([]);
  const [currentSpec, setCurrentSpec] = useState<any>(null);

  const msaYamlRef = useRef(null);


  const queryMsaTemplates = async () => {
    const res = await fetch("https://msa-regy-config-sdivetwiec.cn-hangzhou.fcapp.run/list?page=1&pageSize=20");
    const { Data } = await res.json();
    setMsaTemplates(Data.Items as MsaTemplate[]);
  };

  const queryMsaYaml = async (url: string) => {
    const res = await fetch(url);
    const text = await res.text();
    return text;
  }

  useEffect(() => {
    fetch("/api/config").then((res) => res.json()).then(({ data }) => {
      let globalConfig = jsYaml.load(data.debugConfigContent);
      const scenceProfiles = globalConfig.SceneProfiles;
      setCurrentScenceProfile(scenceProfiles[0]);
      setGlobalParameters(globalConfig.Parameters);
      setConfig(globalConfig);
    });
    queryMsaTemplates();
  }, []);

  useEffect(() => {
    if (currentScenceProfile) {
      fetch(`/api/msa?filePath=${currentScenceProfile.Template}`).then((res) => res.json()).then(({ data }) => {
        setMsaYaml(data.content);
        getSpecs(data.content).then((specs) => {
          // @ts-ignore
          setCurrentSpec(jsYaml.load(specs.specs.Backend.spec));
        })
        engine.parse(data.content, {
          Global: globalParameters,
          Parameters: currentScenceProfile.Parameters,
        }, {
          components
        }).then((parseEngine) => {
          const rs = parseEngine.create();
          const arch = parseEngine.getArchitecture();
          setArch(JSON.stringify(arch, null, 2));
          setRosYaml(rs);
        });
      });
    }
  }, [currentScenceProfile]);

  const handleMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setOpenMenu(prev => !prev);
  };

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await engine.parse(msaYamlRef.current, {
        Global: globalParameters,
        Parameters: currentScenceProfile.Parameters,
      }, {
        components
      }).then((parseEngine) => {
        const rs = parseEngine.create();
        const arch = parseEngine.getArchitecture();
        setArch(JSON.stringify(arch, null, 2));
        setRosYaml(rs);
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <header className="flex item-center gap-4">
        <button
          className="menu"
          onClick={handleMenuClick}
          style={{ minWidth: '100px' }}
        >
          场景列表
        </button>
        <select
          id="select-env"
          className="flex-1"
          onChange={(e) => {
            const selected = config.SceneProfiles.find(profile =>
              profile.Template === e.target.value
            );
            setCurrentScenceProfile(selected);
          }}
        >
          {
            config.SceneProfiles.map((item, index) => (
              <option key={index} value={item.Template}>{item.DisplayName["zh-cn"]}</option>
            ))
          }
        </select>
      </header>
      <section className={`menu-container ${openMenu ? "open" : "close"}`}
        onClick={() => {
          setOpenMenu(false);
        }}
      >
        <div className="menu-content">
          {
            msaTemplates.map((item) => (
              <div className="menu-item"
                key={item.Name}
                onClick={(evt) => {
                  evt.stopPropagation();
                  const content = item.Content;
                  const current = item.Content.SceneProfiles[0];
                  setConfig({
                    SceneProfiles: item.Content.SceneProfiles
                  })
                  queryMsaYaml(current.Template).then((text) => {
                    setMsaYaml(text);
                    engine.parse(text, {
                      Global: content.Parameters,
                      Parameters: current.Parameters,
                    }, {
                      components
                    }).then((parseEngine) => {
                      const rs = parseEngine.create();
                      const arch = parseEngine.getArchitecture();
                      setArch(JSON.stringify(arch, null, 2));
                      setRosYaml(rs);
                    });
                  });
                }}>
                {item.Name}
              </div>
            ))
          }
        </div>
      </section>
      <div id="root">
        <div className="left">
          <div className="panel">
            <h3 className="panel-title">
              <div className="flex justify-between full-w">
                <span>MSA YAML Editor</span>
                <button
                  id="generate-btn"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? '生成中...' : '生成'}
                </button>
              </div>
            </h3>
            <div className="panel-content">
              <CodeMirror
                id="yaml-viewer-editor"
                value={msaYaml}
                extensions={[yaml()]}
                height="100%"
                width="100%"
                lang="yaml"
                theme={materialDark}
                onChange={(value) => {
                  msaYamlRef.current = value;
                }}
              />
            </div>
          </div>
        </div>
        <div className="right">

          <div className="panel">
            <h3 className="panel-title">ROS YAML</h3>
            <div className="panel-content">
              <CodeMirror
                id="yaml-viewer"
                value={rosYaml}
                extensions={[yaml()]}
                height="100%"
                width="100%"
                lang="yaml"
                theme={materialDark}
                readOnly
              />
            </div>
          </div>
          <div className="panel">
            <h3 className="panel-title">Operation JSON</h3>
            <div className="panel-content">
              <CodeMirror
                id="json-viewer"
                value={arch}
                extensions={[json()]}
                height="100%"
                width="100%"
                lang="json"
                theme={materialDark}
                readOnly
              />
            </div>
          </div>
        </div>
        <dialog id="error-dialog">
          <div id="error-dialog-close">X</div>
          <div id="error-dialog-content"></div>
        </dialog>
      </div>
    </div>
  );
}


export default RosTemplate;