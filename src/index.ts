import yaml from "yaml";
import { readFileSync } from "fs";
import { forEach } from "lodash";
import type { CaproverVariable, DockerComposeService } from "./helper/types.ts";
import { writeFileSync } from "node:fs";
import slugify from "slugify";

async function main() {
  const compose: Record<any, any> = yaml.parse(
    readFileSync("files/compose.yml", "utf-8"),
  );
  const result = {
    captainVersion: 4,
    caproverOneClickApp: {
      instructions: {
        start: "Just a plain Docker Compose.",
        end: "Docker Compose is deployed.",
      },
      variables: [] as CaproverVariable[],
      services: {} as Record<string, DockerComposeService>,
    },
  };

  forEach(compose.services, (service: DockerComposeService, serviceName) => {
    // image
    let image = service.image;
    const [imageName, imageVersion] = service.image.split(":");

    if (imageVersion) {
      const varName = slugify(imageName.replace(/\//g, "_"), {
        replacement: "_",
        strict: true,
        trim: true,
        lower: true,
      });

      result.caproverOneClickApp.variables.push({
        id: `$$${varName}_version`,
        label: `${imageName} version`,
        defaultValue: imageVersion,
      });
      image = `${imageName}:$$${varName}_version`;
    }
    // environment
    const composeEnv: Record<string, any> = {};
    const environment: Record<string, any> = {};

    if (Array.isArray(service.environment)) {
      forEach(service.environment, (env) => {
        const [key, value] = env.split("=");
        composeEnv[key] = value;
      });
    }

    forEach(composeEnv, (value, key) => {
      environment[key] = value;
    });

    //
    result.caproverOneClickApp.services[`$$cap_appname-${serviceName}`] = {
      image,
      environment,
    };

    // console.log(service);
  });

  writeFileSync("files/result.yml", yaml.stringify(result, null, 2));
}

void main();
