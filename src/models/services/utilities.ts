const utils = {
  VIEW_DURATION: 500,
  GatewayWidth: 40,
  GatewayHeight: 40,
  ServiceWidth: 180,
  ServiceHeight: 40,
  ServiceGap: 5,
  ServiceStart: 50,
  ClusterPadding: 20,
  SiteRadius: 100,
  siteColors: {},
  serviceColors: {},

  siteColor: (name: any, site_id: string, colorsObj: any) => {
    if (site_id === 'unknownID') {
      return '#FFFFFF';
    }
    const siteColors = colorsObj ? colorsObj : utils.siteColors;
    if (!(site_id in siteColors)) {
      siteColors[site_id] = {
        name,
        color: 'red', //colorGen(Object.keys(siteColors).length * 2),
      };
    }

    return siteColors[site_id].color;
  },

  combineSamples: (targetSamples: any[], samples: { [x: string]: { val: any } }) => {
    targetSamples.forEach((oldSample: { val: any }, i: string | number) => {
      if (oldSample && samples[i]) {
        oldSample.val += samples[i].val;
      }
    });
  },
  // add the source values to the target values for each attribute in the source.
  aggregateAttributes: (
    source: { [x: string]: any },
    target: { [x: string]: any },
    combine?: (arg0: any, arg1: any, arg2: string) => any,
  ) => {
    if (!combine) {
      combine = (a: number, b: number, attr: string) => {
        if (attr === 'start_time') {
          return Math.min(a, b);
        }
        if (attr === 'last_in' || attr === 'last_out' || attr === 'latency_max') {
          return Math.max(a, b);
        }

        return a + b;
      };
    }
    for (const attribute in source) {
      if (target[attribute] === undefined) {
        target[attribute] = source[attribute];
      } else {
        if (typeof source[attribute] === 'object') {
          utils.aggregateAttributes(source[attribute], target[attribute]);
        } else if (!isNaN(source[attribute])) {
          target[attribute] = combine(source[attribute], target[attribute], attribute);
        }
      }
    }
  },

  hasUnicode: (str: string) => {
    for (let i = 0; i < str.length; i++) {
      const cc = str.charCodeAt(i);
      if (cc > 127 || cc < 32) {
        return true;
      }
    }

    return false;
  },

  // is the address a valid ip address?
  // used to differentiate between external (ip address) clients and
  // clients that are resident in a site
  isIP: (address: string) =>
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
      address,
    ),

  //hello-world-frontend-759cdcf7f9-phcjq
  shortName: (name: string) => {
    const parts = name.split('-');
    if (parts.length > 2) {
      const len = parts.length;
      if (
        parts[len - 1].length === 5 &&
        (parts[len - 2].length === 10 || parts[len - 2].length === 9)
      ) {
        parts.splice(len - 2, 2);

        return parts.join('-');
      }
    }

    return name;
  },
};

export { utils };
