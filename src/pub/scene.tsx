import React, { useEffect, useState } from "react";
import jsYaml from "js-yaml";
import { yaml } from "@codemirror/lang-yaml";
import { materialDark } from "@uiw/codemirror-theme-material";
import MseEngine from "msa-engine";
import { components, getSpecs, specMapping } from "msa-spec";
import MsaForm from "msa-form";
import CodeMirror from "@uiw/react-codemirror";
import request from "./request";
import { SceneProfileT } from "./typing";

import '@alicloud/console-components/dist/xconsole.css';

import Tabs from "./components/Tab";

const engine = new MseEngine();

const isEmpty = (obj: any) => {
  return Object.keys(obj).length === 0;
}

function Scene() {

  const [currentScenceProfile, setCurrentScenceProfile] = useState<SceneProfileT | null>(null);
  const [globalParameters, setGlobalParameters] = useState({});
  const [sceneParameters, setSceneParameters] = useState({});
  const [config, setConfig] = useState({ SceneProfiles: [] });
  const [specs, setSpecs] = useState({});
  const [spec, setSpec] = useState({});
  const [activeKey, setActiveKey] = useState("");
  const [deployType, setDeployType] = useState<"Flow" | "Msa">("Msa");
  const [yamlContent, setYamlContent] = useState("");
  const [parsedYamlContent, setParsedYamlContent] = useState("");

  const querySpec = async (currentScenceProfile: SceneProfileT) => {
    if (typeof currentScenceProfile.Spec === "string") {
      const spec = await request<{ content: string }>({
        url: `/api/spec`,
        data: {
          filePath: currentScenceProfile.Spec,
        }
      });
      const msa = await request<{ content: string }>({
        url: `/api/msa`,
        data: {
          filePath: currentScenceProfile.Template,
        }
      });
      if (currentScenceProfile.DeployType === "Flow") {
        setSpec(jsYaml.load(spec.content));
        setYamlContent(spec.content);
        setDeployType("Flow");
      } else {
        setYamlContent(msa.content);
        setSceneParameters(currentScenceProfile.Parameters);
        setDeployType("Msa");
      }
    } else {
      const specPath = Object.keys(currentScenceProfile.Spec).map((key) => {
        return {
          key,
          path: currentScenceProfile.Spec[key]
        };
      });
      const resList = await Promise.all(specPath.map((path) => {
        return request<{ content: string, key: string }>({
          url: `/api/spec`,
          data: {
            filePath: path.path,
            key: path.key
          }
        });
      }));
      const specificSpecs = {};
      resList.forEach(({ key, content }) => {
        specificSpecs[key] = {
          type: specMapping[key] || "",
          spec: content
        };
      });
      const msa = await request<{ content: string }>({
        url: `/api/msa`,
        data: {
          filePath: currentScenceProfile.Template,
        }
      });
      getSpecs(msa.content).then((spec) => {
        const mergedSpecs = { ...spec.specs, ...specificSpecs };
        setSpecs(mergedSpecs);
        setActiveKey(Object.keys(mergedSpecs)[0]);
        setYamlContent(msa.content);
      });
      setSceneParameters(currentScenceProfile.Parameters);
    }
  }

  useEffect(() => {
    request<{ debugConfigContent: string }>({
      url: "/api/config",
    }).then(({ debugConfigContent }) => {
      let globalConfig = jsYaml.load(debugConfigContent);
      const scenceProfiles = globalConfig.SceneProfiles;
      setCurrentScenceProfile(scenceProfiles[0]);
      setGlobalParameters(globalConfig.Parameters);
      setConfig(globalConfig);
    });
  }, []);

  useEffect(() => {
    if (currentScenceProfile?.Spec) {
      querySpec(currentScenceProfile);
    }
  }, [currentScenceProfile]);

  useEffect(() => {
    if (yamlContent && !isEmpty(sceneParameters)) {
      if (deployType === "Flow") {
        const res = engine.core.render(yamlContent, {
          ...sceneParameters,
          ...globalParameters,
        });
        setParsedYamlContent(res);
      } else {
        engine.parse(yamlContent, {
          Global: globalParameters,
          Parameters: sceneParameters,
        }, {
          components
        }).then((parseEngine) => {
          const rs = parseEngine.create();
          setParsedYamlContent(rs);
        });
      }
    }
  }, [sceneParameters, globalParameters, yamlContent, deployType]);

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
    console.log(params, 'params...')
    setSceneParameters(params);
  }

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
                onSubmit={(values) => setSceneParameters(values)}
              />
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
          }}>{deployType === "Flow" ? "Flow" : "ROS"} YAML</h3>
          <div className="flex-1" style={{ height: "100%", overflow: "auto", backgroundColor: "#2e3235" }}>
            <CodeMirror
              height={"100%"}
              value={parsedYamlContent}
              extensions={[yaml()]}
              lang="yaml"
              theme={materialDark}
              readOnly
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
