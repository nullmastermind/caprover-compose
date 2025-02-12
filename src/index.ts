import yaml from "yaml";
import { readFileSync } from "fs";
import { forEach, map, uniqBy } from "lodash";
import type { CaproverVariable, DockerComposeService } from "./helper/types.ts";
import { writeFileSync } from "node:fs";
import slugify from "slugify";

async function main() {
  const compose: Record<any, any> = yaml.parse(
    readFileSync(process.env.COMPOSE_FILE as string, "utf-8"),
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
    const image = (() => {
      let image = service.image;

      if (!image) return undefined;

      const [imageName, imageVersion] = image.split(":");

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

      return image;
    })();

    result.services[`$$cap_appname-${serviceName}`] = {
      image: (() => {
        if (service.entrypoint) return undefined;
        return image;
      })(),
      environment: (() => {
        const composeEnv: Record<string, any> = {};
        const environment: Record<string, any> = {};

        if (Array.isArray(service.environment)) {
          forEach(service.environment, (env) => {
            const [key, value] = env.split("=");
            composeEnv[key] = value;
          });
        } else {
          forEach(service.environment, (value, key) => {
            composeEnv[key] = value;
          });
        }

        forEach(composeEnv, (value, key) => {
          if (key === "<<") {
            forEach(value, (value1, key1) => {
              composeEnv[key1] = value1;
            });
            delete composeEnv[key];
          }
        });

        forEach(composeEnv, (value, key) => {
          const varName = `$$cap_${slugify(key, {
            replacement: "_",
            strict: true,
            trim: true,
            lower: true,
          })}`;

          if (typeof value === "number") value = value.toString();

          if (typeof value === "undefined") {
            result.caproverOneClickApp.variables.push({
              id: varName,
              label: key,
            });
            value = varName;
          } else if (value?.startsWith("$")) {
            result.caproverOneClickApp.variables.push({
              id: varName,
              label: key,
            });
            value = varName;
          } else {
            result.caproverOneClickApp.variables.push({
              id: varName,
              label: key,
              defaultValue: value,
            });
          }

          environment[key] = value;
        });

        if (Object.keys(environment).length) return environment;

        return undefined;
      })(),
      ports: service.ports,
      hostname: service.hostname,
      command: service.command,
      volumes: (() => {
        const volumes = map(service.volumes, (volume) => {
          if (volume.startsWith("./")) volume = volume.replace("./", "");

          let splitVolume = volume.split(":");

          if (splitVolume?.[0]?.includes("/")) {
            // return volume;
            splitVolume[0] = slugify(splitVolume[0])
              .split(".")
              .join("-")
              .split("_")
              .join("-");
            volume = splitVolume.join(":");
          }
          return `$$cap_appname-${volume}`;
        });

        if (volumes.length) return volumes;

        return undefined;
      })(),
      caproverExtra: (() => {
        const base: Record<string, any> = {};

        if (service.entrypoint) {
          base["dockerfileLines"] = [
            `FROM ${image}`,
            `ENTRYPOINT ${JSON.stringify(Array.isArray(service.entrypoint) ? service.entrypoint : [service.entrypoint])}`,
          ];
        }

        if (service.ports?.length) {
          return {
            ...base,
            containerHttpPort: service.ports[0].split(":").pop(),
          };
        }

        return {
          ...base,
          notExposeAsWebApp: true,
        };
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

    // console.log(service);
  });

  writeFileSync(
    process.env.OUTPUT_FILE as string,
    yaml.stringify(result, null, 2),
  );
}

void main();
