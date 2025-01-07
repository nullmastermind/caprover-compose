import yaml from "yaml";
import { readFileSync } from "fs";
import { forEach, map, uniqBy } from "lodash";
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
    },
    services: {} as Record<string, DockerComposeService>,
  };

  forEach(compose.services, (service: DockerComposeService, serviceName) => {
    // image
    let image = service.image;
    const [imageName, imageVersion] = service.image.split(":");

    if (imageVersion) {
      const varName = `$$cap_${slugify(imageName.replace(/\//g, "_"), {
        replacement: "_",
        strict: true,
        trim: true,
        lower: true,
      })}_version`;

      result.caproverOneClickApp.variables.push({
        id: varName,
        label: `${imageName} version`,
        defaultValue: imageVersion,
      });
      image = `${imageName}:${varName}`;
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
      const varName = `$$cap_${slugify(key, {
        replacement: "_",
        strict: true,
        trim: true,
        lower: true,
      })}`;

      if (typeof value === "undefined") {
        result.caproverOneClickApp.variables.push({
          id: varName,
          label: key,
        });
        value = varName;
      } else if (value?.startsWith("$")) {
        // result.caproverOneClickApp.variables.push({
        //   id: value,
        //   label: key,
        // });
      } else {
        result.caproverOneClickApp.variables.push({
          id: varName,
          label: key,
          defaultValue: value,
        });
      }

      environment[key] = value;
    });

    //
    result.services[`$$cap_appname-${serviceName}`] = {
      image,
      environment,
      ports: service.ports,
      hostname: service.hostname,
      command: (() => {
        if (!service.command && service.entrypoint) {
          return service.entrypoint;
        }
        return service.command;
      })(),
      volumes: (() => {
        const volumes = map(
          service.volumes,
          (volume) => `$$cap_appname-${volume}`,
        );

        if (volumes.length) return volumes;

        return undefined;
      })(),
      caproverExtra: (() => {
        if (service.ports?.length) {
          return {
            containerHttpPort: service.ports[0].split(":").shift(),
          };
        }
        return undefined;
      })(),
      depends_on: (() => {
        const dependsOn = map(
          service.depends_on,
          (dependOn) => `$$cap_appname-${dependOn}`,
        );

        if (dependsOn.length) return dependsOn;

        return undefined;
      })(),
    };
    result.caproverOneClickApp.variables = uniqBy(
      result.caproverOneClickApp.variables,
      (variable) => variable.id,
    );

    forEach(result.caproverOneClickApp.variables, (variable) => {
      if (
        variable.id.includes("password") &&
        typeof variable.defaultValue === "undefined"
      ) {
        variable.defaultValue = `$$cap_gen_random_hex(32)`;
      } else if (
        variable.id.includes("user") &&
        typeof variable.defaultValue === "undefined"
      ) {
        variable.defaultValue = `root`;
      }
    });

    // console.log(service);
  });

  writeFileSync("files/result.yml", yaml.stringify(result, null, 2));
}

void main();
