# Strapi plugin for ComfyUI

## Installation

To install the Strapi plugin for ComfyUI, follow these steps:

1. Install the plugin:

   ```bash
   npm install @alexgao/strapi-plugin-comfyui
   ```

2. Enable the plugin in Strapi:

   ```
   ...

   'strapi-plugin-comfyui': {
     enabled: true,
     config: {
       comfyui: {
         host: env('COMFYUI_HOST', ''),
         port: env.int('COMFYUI_PORT', 8188),
       },
     },
   },

   ...
   ```

3. Start the Strapi server:

   ```bash
   npm run develop
   ```

<!-- ## Usage

To use the Strapi plugin for ComfyUI, follow these steps:

1. Access the Strapi admin panel at `http://localhost:1337/admin`.

2. Navigate to the "Plugins" section in the sidebar.

3. Find the "ComfyUI" plugin and click on it.

4. Configure the plugin settings according to your needs.

5. Save the changes and start using the ComfyUI features in your Strapi project. -->

## Contributing

Contributions are welcome! If you encounter any issues or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
