import fs from 'node:fs/promises';
import * as Container from '@src/container';

const PLACEHOLDER_REGEX = /<!--SSR-(APP|STYLES|STATE|ROUTES)-->/g;

let cachedTemplate: string | null = null;

export class AppTemplate {
  private parts: Record<string, string> = {};

  constructor(public value: string) {}

  static load = async () => {
    const env = Container.inject('env');

    if (!cachedTemplate || env.mode === 'development') {
      const appConfig = Container.inject('appConfig');
      cachedTemplate = await fs.readFile(appConfig.paths.template, 'utf-8');
    }

    return new AppTemplate(cachedTemplate);
  };

  set app(data: string) {
    this.parts.APP = data;
  }

  set styles(data: string) {
    this.parts.STYLES = data;
  }

  set state(data: string) {
    this.parts.STATE = data;
  }

  set routes(data: string) {
    this.parts.ROUTES = data;
  }

  render(): string {
    return this.value.replace(PLACEHOLDER_REGEX, (match, key) => this.parts[key] ?? match);
  }
}
