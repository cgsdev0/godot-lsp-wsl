# godot-lsp-wsl

[![npm](https://img.shields.io/npm/v/godot-lsp-wsl)](https://www.npmjs.com/package/godot-lsp-wsl)

Proxy the godot language server from windows to WSL. Assumes you are using these settings in your Godot Editor Settings:
![image](https://user-images.githubusercontent.com/4583705/202837837-c76830df-1393-46e6-9d44-ec26b0ce3812.png)

This tool will allow you to use Godot language server from an editor in WSL (e.g. neovim)

Run with:
```
npx godot-lsp-wsl
```

Or, alternatively:
```
npm install -g godot-lsp-wsl
godot-lsp-wsl
```

**NOTE:** This currently only works for projects stored in the `C:/` drive. This is a limitation I plan to address soon!
