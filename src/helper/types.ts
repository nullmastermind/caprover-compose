export interface CaproverVariable {
  id: string;
  label: string;
  defaultValue?: any;
  description?: string;
}

export interface DockerComposeService {
  image: string;
  environment?: string[] | Record<string, string>;
  ports?: string[];
  volumes?: string[];
  depends_on?: string[];
  hostname?: string;
  command?: any;
  caproverExtra?: {
    containerHttpPort?: string;
  };
  entrypoint?: string;
}
