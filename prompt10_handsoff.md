escrivivir-co: Ayuda para gestionar un submodule.

Repositorio objetivo: mcp-mesh-sdk

Repositorio submodule: alephscript-mcp-presets-site

El directorio #file:zeus como submodule para reemplazar #file:web .

Para no romper el objetivo haremos que zeus se instale al lado de web. Así "mcp-mesh-sdk" podrá usar o web o zeus.

De momento quiero usar el sistema de ficheros local que no tengo los repos en url, ¿puede ser?

GitHub Copilot: Voy a configurar el submodule local paso a paso: primero verifico ambos repos, luego añado el submodule en mcp-mesh-sdk bajo src/zeus-site usando una URL local relativa, activo sparse-checkout para solo la carpeta zeus y hago commit. Después te dejo cómo usarlo.

Created 5 todos

Ran terminal command: git -C "REPOS/mcp-mesh-sdk" status --porcelain=v1 -b

Ran terminal command: git -C "REPOS/alephscript-mcp-presets-site" status --porcelain=v1 -b

Ran terminal command: git --version

Para asegurar que ambos repos están listos y luego agregar el submodule con ruta local, voy a ejecutar comprobaciones de Git y después el comando para añadir el submodule con ruta relativa, seguido de la configuración de sparse-checkout.

Ran terminal command: git -C "REPOS/mcp-mesh-sdk" rev-parse --is-inside-work-tree && git -C "REPOS/mcp-mesh-sdk" rev-parse --abbrev-ref HEAD

Ran terminal command: git -C "REPOS/alephscript-mcp-presets-site" status --porcelain=v1 -b

Ran terminal command: git -C "REPOS/alephscript-mcp-presets-site" rev-parse --abbrev-ref HEAD

Ran terminal command: git -C "REPOS/mcp-mesh-sdk" submodule add -b dev/sprint05_prompt10 "../alephscript-mcp-presets-site" "src/zeus-site"

Ran terminal command: git -C "REPOS/mcp-mesh-sdk" status -sb

Ran terminal command: git -C "REPOS/mcp-mesh-sdk/src/zeus-site" sparse-checkout set zeus

Ran terminal command: git -C "REPOS/mcp-mesh-sdk/src/zeus-site" sparse-checkout list

Ran terminal command: git -C "REPOS/mcp-mesh-sdk/src/zeus-site" status -sb

Ran terminal command: git -C "REPOS/mcp-mesh-sdk/src/zeus-site" ls-tree --name-only HEAD

Ran terminal command: git -C "REPOS/mcp-mesh-sdk/src/zeus-site" sparse-checkout set "zeus/**"

Ran terminal command: git -C "REPOS/mcp-mesh-sdk/src/zeus-site" sparse-checkout set zeus/

Ran terminal command: git -C "REPOS/mcp-mesh-sdk/src/zeus-site" sparse-checkout list

Ran terminal command: git -C "REPOS/mcp-mesh-sdk" add .gitmodules src/zeus-site

Ran terminal command: git -C "REPOS/mcp-mesh-sdk" commit -m "feat(submodule): add local submodule alephscript-mcp-presets-site at src/zeus-site with sparse-checkout zeus/"

Ran terminal command: git -C "REPOS/mcp-mesh-sdk" config -e --local

Read []REPOS/mcp-mesh-sdk/.gitmodules)

Searched for files matching `**/REPOS\mcp-mesh-sdk\src\zeus-site\zeus`, no matches

Voy a añadir documentación y un script de setup para facilitar el uso del submodule (sparse-checkout y actualización) y dejarlo todo listo. Luego haré commit de estos archivos.

Created []REPOS/mcp-mesh-sdk/docs)

Created []REPOS/mcp-mesh-sdk/docs/ZEUS_SUBMODULE.md)

Created []REPOS/mcp-mesh-sdk/scripts/update-zeus-submodule.sh)

Created []REPOS/mcp-mesh-sdk/scripts/update-zeus-submodule.bat)

Ran terminal command: git -C "REPOS/mcp-mesh-sdk" add docs/ZEUS_SUBMODULE.md scripts/update-zeus-submodule.*

Made changes.

escrivivir-co: Espera, transforma tu ZEUS_SUBMODULE.md en otros tipos de archivos.

Elige uno o varias técnicas de https://code.visualstudio.com/docs/copilot/customization/overview...

 y agrega en #file:mcp-mesh-sdk / .github los archivos en el formato válido.

GitHub Copilot: Para elegir correctamente los formatos de personalización de Copilot y generar archivos válidos en .github, voy a revisar la documentación oficial de "Copilot customization" para confirmar nombres de archivo y opciones soportadas. Luego crearé los archivos correspondientes con el contenido adaptado de ZEUS_SUBMODULE.md.

Using "Fetch Web Page"

Fetched https://code.visualstudio.com/docs/copilot/customization/overview

Voy a confirmar las rutas y formatos exactos de archivos soportados para Custom instructions, Prompt files y Chat modes en Copilot para generar los archivos válidos en .github.

Using "Fetch Web Page"

Fetched https://code.visualstudio.com/docs/copilot/customization/prompt-files

Using "Fetch Web Page"

Fetched https://code.visualstudio.com/docs/copilot/customization/custom-instructions

Using "Fetch Web Page"

Fetched https://code.visualstudio.com/docs/copilot/customization/custom-chat-modes

Created []REPOS/mcp-mesh-sdk/.github)

Created []REPOS/mcp-mesh-sdk/.github/instructions)

Created []REPOS/mcp-mesh-sdk/.github/prompts)

Created []REPOS/mcp-mesh-sdk/.github/chatmodes)

Created []REPOS/mcp-mesh-sdk/.github/copilot-instructions.md)

Created []REPOS/mcp-mesh-sdk/.github/instructions/zeus-submodule.instructions.md)

Created []REPOS/mcp-mesh-sdk/.github/prompts/init-zeus-submodule.prompt.md)

Created []REPOS/mcp-mesh-sdk/.github/chatmodes/Zeus-Mode.chatmode.md)

Read todo list

Completed (1/6) *Comprobar repos locales y estado Git*

Ran terminal command: git -C "REPOS/mcp-mesh-sdk" add .github docs/ZEUS_SUBMODULE.md scripts/update-zeus-submodule.*

Made changes.