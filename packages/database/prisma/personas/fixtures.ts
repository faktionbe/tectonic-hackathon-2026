import { addDries } from './dries';
import { addEva } from './eva';
import { FixtureBuilder, type PersonaFixtures } from './fixture-builder';
import { addJonasSarah } from './jonas-sarah';
import { addKelly } from './kelly';
import { addLotte } from './lotte';
import { addMarc } from './marc';

export const createPersonaFixtures = (): PersonaFixtures => {
  const builder = new FixtureBuilder();
  addLotte(builder);
  addJonasSarah(builder);
  addEva(builder);
  addMarc(builder);
  addDries(builder);
  addKelly(builder);
  return builder.finish();
};
