/*
 * @Author: oudingyin
 * @Date: 2019-08-26 09:17:48
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-30 16:47:07
 */
import request = require("request-promise-native");
import iconv = require("iconv-lite");
import { UA, global_req } from "../../common/config";

interface Setting {
  spm: string;
  req: request.RequestPromiseAPI;
  appKey: string;
  mteeInfo: any;
  cookie: string;
  token: string;
}

// @ts-ignore
var setting: Setting = {
  spm: "a222m.7628550.0.0",
  appKey: "12574478",
  mteeInfo: {
    mteeAsac: "1A19322J4Z3PLXO583LRB6",
    mteeType: "sdk",
    mteeUa:
      "118#ZVWZzwoQWZOMce1AcZ2C2ZZTZeeh2Z3PZe2x1zqTzHRzZyCZXoTSOE2zZCmQVHR4Zg2ZOzqTzfQZZZZZyUTctZxv2ic2vggVZZZuusqhzeWZZZZ/VoTXlZ2Z2Z+hyGeaZZZ1ZsiTzeWzZgFZVoqaYH2zZZ+TXHWVZgZZZsqTzeRzZZZ/Voq4zeZzZewiXHWVZgYmZzqXugQzAgZ+13uiEMgZAYuKXd/OqQHJZCuD2VjFDmBX0C2chjPmY26t+uqvOHMh/9AaugZCmrDtKHZzhSb7VjJOheZTtBs5MfQ16oArfK5BsYqKD1184zinpXcsW+SGYAuaz67WTu+xQWzBUeNthJxTVO/OdITR/qhhsVAK6bw7pmnFRiO2gto4LFW+L6qXg47/ENel0VQN2kE03NZgMMrQdmdvraOVFlk/H2HpbwVQtqir2dohTjEvB9R6Ke2BApCluW8SVnqQqQFp2xph96B2ffyd4OrysMsMvaNRAh7Rh1Sa5+a0n7h9Nq90SSJJq+YI+T2kuCiQ7mmvJWLvo2xzhUd0K2p5By38syqGNJPF9LOEJavnVIqe/8vFhIAcEsG/QN2qlDCWkp3h6VsVuWKjRi2I8foq4tVGNBxffzAoWqfQTDFijzCZXp5uv1WDulAqQjqe1oAhqhUa0B7uSMz4q1upLZr7EEZYrKffq9dE8fLod9cybaR9cEZ6oyDBCttgvsSGY1OlOakcl/Y++eMWwgNoCC3Wg8XnO6eWvoTX6oqIJ0ODfQhK1phwmcLs8g/YoUFi7eVWWYWvNtb9LJlXBO4On7HiWAbH/rcED1sjC63hfNEJTK9ePmoZs0hFZNJvzFhznsV/C70C0DjCBOV+WCJTTDpYoP/LEfQbRpRHAB5UfZIRSFZgYAKd6djO3hfSolSenQ1WDpuC1WfJMpoSNa4jj4fL6tvWG36B0ql/kG4TID1KKPiI9r8KoRdgkI/U3n4IUVGgHJXC5A+eZh5RmjYo5kJppMDWQ6YuJtNqSFRZLXMwKdEtUjpl2nAs1PD4JuIOAGSpzJOw/rmeFEmWoWs4CmWiG+Y5VtIu3z9VqChym6YYTdeQ6R7e1c8ednj7ppetA0XuL8XNXz/AB0uCr7yGYdYPs3gjWx+wNK+wfEGxJRW0lsF64B0iFw++ciqIKhqt2EbaqMNzLiV3FHwLwy0VF8OegMIcX46igQkn5xfkrwO4kTF4c+F4QZKlJGC55aeKpKAkMsGFqQ+wFlRLZn4I+mFkJKoBN4HE+mNkasj+r7WFsQ3voJklRjLYyyNtjfTFnz9xW1FerxD/yOwx8Kc5rmWlKFSv7V5980z9kw5aHedoaX/vrILcugZSvLxTD/4RVTK7b70JB0PCJh5pOLPsrBaUs8mup/zbO1GwVD+ckUJlyBVQHFJn4IAh3SMRQhvZCHPYwCcww5Llswe1ziLEUMUHZEKQaRTN31MZwcj/R5GISZk+t7sFIW3WriuoIRPUW+owiEHU4zti8Zs9dctB2Vg5yE5Um/ujdjAaau28rzm+OCJwn+1J9UfCQj5mk3FccKwLFM6fSqUQrKU6UINbSZZUv7cXq3B3L2fT8WRCvsXTABH3/VkF2vENTW2rGkeon+l5ifriuammRyitrbI36s1Dkxv/2p+I6ZQQi+ybrcdBIOOZptSDHNkZZrNUkVpAVeU+pTQq5gqwM2oS4lO63qSfmll4Jwnv15cZH4S34R6WG8a8LHFFk4muSDjEFlCbAWdRPdr6PJXqoEiPu9h8HUd8ZGpfLuya3R7qw6++LAO6WfC93+8r9TXB58dqpgf2g2thao3311tinHBhzniQWTQLpab1TmsHEYRwr2WODuLwNnSHHcBlTVaGUziBRMWN0UEOGlFWDRiovNGNEFujZsggZpomiNbGaOS+fpVAxxVwedPoUlcV",
    ulandSrc: "201_11.230.188.217_8942114_1563529853358",
    umidToken: "T1B909C1008F917EC23F10509E607EFB7EF74F21A9C621A9A956FAEDC63"
  },
  req: global_req.defaults({
    headers: {
      "User-Agent": UA.wap
    }
  })
};

export default setting;

export function setSetting(name: keyof Setting, value: any) {
  setting[name] = value;
}
