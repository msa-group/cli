export interface SceneProfileT {
  Name: string;
  Parameters: Record<string, any>;
  Spec: Record<string, string> | string;
  Template: string;
  DeployType?: "Flow" | "Msa";
}


