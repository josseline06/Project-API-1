# Duckbook - API
El API realizado para la elaboración de la red social de Duckface

### Base de Datos

Este api está desarrollado para utilizar mongoDB con mongoose, al ejecutarlo usa (o crea en caso de no existir) una base de datos llamada 'duckbook-api' en el puerto 27017 (puerto por defecto de mongoDB). Puede encontrarse esta información en el archivo config.js

### Build and Run

Primero, instalar dependencias usando npm:

```sh
npm install
```

Ejecutar el proyecto:

```sh
node server.js
```

E ir a [localhost:8080/api](http://localhost:8080/api).
 
La documentación puede ser encontrada en [localhost:8080/api/docs](http://localhost:8080/api/docs).

![DuckFace](./app/static/img/DuckFace-Diagrama de Clases.png "Diagrama de Clases")
