// vuetify.js
import { createVuetify } from 'vuetify';
import '@mdi/font/css/materialdesignicons.css'; // Ensure MDI icons are imported

const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi', // Specify MDI as the default icon set
  },
});

export default vuetify;
