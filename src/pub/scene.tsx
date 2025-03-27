import React, { useEffect, useState, useRef } from "react";
import jsYaml from "js-yaml";
import { yaml } from "@codemirror/lang-yaml";
// import { json } from "@codemirror/lang-json";
import { materialDark } from "@uiw/codemirror-theme-material";
import MseEngine from "msa-engine";
import { components, getSpecs, specMapping } from "msa-spec";
import MsaForm from "msa-form";
import CodeMirror from "@uiw/react-codemirror";
import '@alicloud/console-components/dist/xconsole.css';

import Tabs from "./components/Tab";

const engine = new MseEngine();

const isEmpty = (obj: any) => {
  return Object.keys(obj).length === 0;
}

function Scene() {

  const [msaYaml, setMsaYaml] = useState("");
  const [currentScenceProfile, setCurrentScenceProfile] = useState(null);
  const [globalParameters, setGlobalParameters] = useState({});
  const [sceneParameters, setSceneParameters] = useState({});
  const [rosYaml, setRosYaml] = useState("");
  const [flowYaml, setFlowYaml] = useState("");
  const [config, setConfig] = useState({ SceneProfiles: [] });
  const [specs, setSpecs] = useState({});
  const [spec, setSpec] = useState({});
  const [activeKey, setActiveKey] = useState("");
  const [rosYamlEditorHeight, setRosYamlEditorHeight] = useState(0);
  const [deployType, setDeployType] = useState<"Flow" | "Msa">("Msa");
  const rosYamlRef = useRef<HTMLDivElement>(null);





  useEffect(() => {
    fetch("/api/config").then((res) => res.json()).then(({ data }) => {
      let globalConfig = jsYaml.load(data.debugConfigContent);
      const scenceProfiles = globalConfig.SceneProfiles;
      setCurrentScenceProfile(scenceProfiles[0]);
      setGlobalParameters(globalConfig.Parameters);
      setConfig(globalConfig);
    });
  }, []);

  useEffect(() => {
    if (currentScenceProfile) {
      if (currentScenceProfile.Spec) {
        if (typeof currentScenceProfile.Spec === "string") {
          fetch(`/api/spec?filePath=${currentScenceProfile.Spec}`).then((res) => res.json()).then(({ data }) => {
            const spec = jsYaml.load(data.content);
            fetch(`/api/msa?filePath=${currentScenceProfile.Template}`).then((res) => res.json()).then(({ data }) => {
              setSpec(spec);
              if (currentScenceProfile.DeployType === "Flow") {
                setFlowYaml(data.content);
                setDeployType("Flow");
              } else {
                setMsaYaml(data.content);
                setSceneParameters(currentScenceProfile.Parameters);
                setDeployType("Msa");
              }
            });
          });
        } else {
          const specPath = Object.keys(currentScenceProfile.Spec).map((key) => {
            return {
              key,
              path: currentScenceProfile.Spec[key]
            };
          });
          Promise.all(specPath.map((path) => {
            return fetch(`/api/spec?filePath=${path.path}&key=${path.key}`).then((res) => res.json());
          })).then((res) => {
            const specificSpecs = {};
            res.forEach(({ data }) => {
              specificSpecs[data.key] = {
                type: specMapping[data.key] || "",
                spec: data.content
              };
            });
            fetch(`/api/msa?filePath=${currentScenceProfile.Template}`).then((res) => res.json()).then(({ data }) => {
              setMsaYaml(data.content);
              getSpecs(data.content).then((spec) => {
                const mergedSpecs = { ...spec.specs, ...specificSpecs };
                setSpecs(mergedSpecs);
                setActiveKey(Object.keys(mergedSpecs)[0]);
              });
              setSceneParameters(currentScenceProfile.Parameters);
            });
          });
        }
      }
    }
  }, [currentScenceProfile]);

  useEffect(() => {
    if (msaYaml && !isEmpty(sceneParameters)) {
      engine.parse(msaYaml, {
        Global: globalParameters,
        Parameters: sceneParameters,
      }, {
        components
      }).then((parseEngine) => {
        const rs = parseEngine.create();
        setRosYaml(rs);
      });
    }
  }, [sceneParameters, msaYaml]);

  const onSubmit = (key, values: any) => {
    const params = Object.assign({}, sceneParameters);
    if (params[key]) {
      params[key] = {
        ...params[key],
        ...values
      }
    } else {
      params[key] = values;
    }

    setSceneParameters(params);
  }

  useEffect(() => {
    if (rosYamlRef.current) {
      setRosYamlEditorHeight(rosYamlRef.current.clientHeight);
    }
  }, [rosYamlRef.current]);

  const specsKey = Object.keys(specs);

  return (
    <div className="scene-container" style={{
      padding: "2rem",
      paddingTop: "3rem",
      display: "flex",
      gap: "2rem",
      height: "100vh",
      backgroundColor: "#f5f5f5",
    }}>
      {
        !isEmpty(spec)
          ? (
            <div className="flex-1">
              <MsaForm
                formConfig={{
                  ...spec as any,
                }}
                onSubmit={(values) => {
                  if (deployType === "Flow") {
                    const res = engine.core.render(flowYaml, {
                      ...values,
                      ...globalParameters,
                    });
                    setFlowYaml(res);
                  } else {
                    
                  }
                }}
              / >
            </div>
          )
          : (
            <Tabs
              className="scene-tabs flex-1"
              activeKey={activeKey}
              onChange={setActiveKey}
              tabClassName="scene-tab-item"
              contentClassName="scene-tab-content"
              items={specsKey.map((key) => {
                const spec = specs[key].spec;
                const specJson = jsYaml.load(spec);
                return {
                  key,
                  label: key,
                  content: (
                    <SpecForm title={key} spec={specJson} globalParameters={globalParameters} onSubmit={onSubmit} />
                  )
                }
              })}
            />
          )
      }

      <div className="flex-1">
        <div style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          overflow: "hidden"
        }}>
          <h3 style={{
            padding: "1rem",
            margin: 0,
            backgroundColor: "#fff",
            borderBottom: "1px solid #e0e0e0",
            fontSize: "1.1rem",
            fontWeight: 500
          }}>ROS YAML</h3>
          <div ref={rosYamlRef} className="flex-1">
            <CodeMirror
              height={rosYamlEditorHeight + "px"}
              value={rosYaml || flowYaml}
              extensions={[yaml()]}
              lang="yaml"
              theme={materialDark}
            // readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecForm(props: { spec: any, title: string, globalParameters: any, onSubmit: (key: string, values: any) => void }) {
  const { spec, title, globalParameters, onSubmit } = props;
  const mutSpec = Object.assign({}, spec);
  if (mutSpec?.Parameters?.YamlContent) {
    mutSpec.Envs = globalParameters
    // @ts-ignore
    mutSpec.Parameters.YamlContent.Component = "Custom";
    // @ts-ignore
    mutSpec.Parameters.YamlContent.ComponentProps = {
      renderFunc: ({ key, config, field, FormItem }) => {
        return (
          <FormItem
            key={key} label={config.label['zh-cn']} required={config.required}
          >
            <CodeMirror
              minHeight="300px"
              {...field.init(key)}
              extensions={[yaml()]}
              lang="yaml"
              theme={materialDark}
            />
          </FormItem>
        )
      }
    };
  }
  return (
    <div className="flex-1" style={{
      padding: "1rem",
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      height: "100%",
      overflow: "auto"
    }}>
      <MsaForm
        formConfig={{
          Title: title,
          ...mutSpec,
        }}
        onSubmit={(values) => onSubmit(title, values)}
      />
    </div>
  )
}


export default Scene;
