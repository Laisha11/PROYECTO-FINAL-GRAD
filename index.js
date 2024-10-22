
const sql = require("mssql/msnodesqlv8");
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');


const app = express();
const port = 3000;

app.use(cors());


var config = {
    server: "(localdb)\\sqlproyecto",
    database: "PROYECTO",
    driver: "msnodesqlv8",
    options: {
        trustedConnection: true

    }
};

async function getConnection() {
    try {
        const pool = await sql.connect(config);
        return pool;
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
        throw error;
    }
}


// Middleware
app.use(bodyParser.json());


// Endpoint para obtener datos de la tabla 'empresa'
app.get('/api/empresa', (req, res) => {
    sql.connect(config, function (err) {
        if (err) {
            console.log(err);
            res.status(500).send('Error de conexión a la base de datos');
        } else {
            var request = new sql.Request();
            request.query("SELECT * FROM empresa", function (err, records) {
                if (err) {
                    console.log(err);
                    res.status(500).send('Error en la consulta');
                } else {
                    res.json(records.recordset);
                }
            });
        }
    });
});

// Endpoint para obtener datos de la tabla 'ARTICULO'
app.get('/api/articulo', (req, res) => {
    sql.connect(config, function (err) {
        if (err) {
            console.log(err);
            res.status(500).send('Error de conexión a la base de datos');
        } else {
            var request = new sql.Request();
            request.query("SELECT * FROM articulo", function (err, records) {
                if (err) {
                    console.log(err);
                    res.status(500).send('Error en la consulta');
                } else {
                    res.json(records.recordset);
                }
            });
        }
    });
});

// Endpoint para obtener datos de la tabla 'usuario'
app.get('/api/usuario', (req, res) => {
    sql.connect(config, function (err) {
        if (err) {
            console.log(err);
            res.status(500).send('Error de conexión a la base de datos');
        } else {
            var request = new sql.Request();
            request.query("SELECT * FROM usuario", function (err, records) {
                if (err) {
                    console.log(err);
                    res.status(500).send('Error en la consulta');
                } else {
                    res.json(records.recordset);
                }
            });
        }
    });
});

// Endpoint para agregar un nuevo registro a la tabla 'empresa'
app.post('/api/empresa', (req, res) => {
    // Extraer datos del cuerpo de la solicitud
    const { EMPRESA, NOM_EMPRESA, DIRECCION } = req.body;

    sql.connect(config, function (err) {
        if (err) {
            console.log(err);
            res.status(500).send('Error de conexión a la base de datos');
        } else {
            var request = new sql.Request();
            // Consulta para insertar el registro
            const query = `INSERT INTO empresa (EMPRESA, NOM_EMPRESA, DIRECCION) VALUES ('${EMPRESA}', '${NOM_EMPRESA}', '${DIRECCION}')`;

            request.query(query, function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(500).send('Error al insertar el registro');
                } else {
                    res.status(201).send('Registro insertado correctamente');
                }
            });
        }
    });
});





// Endpoint para agregar el ingreso de usuario conectado a la tabla 'usuario'
app.post('/api/usuario', (req, res) => {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
        return res.status(400).json({ error: 'Faltan datos' });
    }

    // Validación de usuario y contraseña desde la base de datos
    sql.connect(config, function (err) {
        if (err) {
            return res.status(500).send('Error de conexión a la base de datos');
        }
        
        var request = new sql.Request();
        const query = `SELECT * FROM usuario WHERE usuario = '${usuario}' AND password = '${password}'`;

        request.query(query, function (err, result) {
            if (err) {
                console.log(err);
                return res.status(500).send('Error en la consulta de usuario');
            }
            
            if (result.recordset.length > 0) {
                res.status(200).json({ message: 'Login exitoso' });
            } else {
                res.status(401).json({ message: 'Credenciales incorrectas' });
            }
        });
    });
});




// Endpoint para agregar un nuevo registro a la tabla 'usuario'

app.post('/api/usuariore', (req, res) => {
    // Extraer datos del cuerpo de la solicitud
    const { usuario, nombre, password } = req.body;

    sql.connect(config, function (err) {
        if (err) {
            console.log(err);
            res.status(500).send('Error de conexión a la base de datos');
        } else {
            var request = new sql.Request();
            // Consulta para insertar el registro
            const query = `INSERT INTO usuario (usuario, nombre, password) 
            VALUES ('${usuario}', '${nombre}', '${password}')`;

            request.query(query, function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(500).send('Error al insertar el registro');
                } else {
                    res.status(201).json({ message: 'Registro insertado correctamente' });
                }
            });
        }
    });
});



// Endpoint para agregar un nuevo producto usando sp CREA_ARTICULO
app.post('/api/crearArticulo1', async (req, res) => {
    const { SKU, DESCRIPCION, MARCA, CATEGORIA, SUBCATEGORIA, SSUBCATEGORIA, BARRA, PRECIO, EMPRESA } = req.body;

    try {
        const pool = await getConnection();

        // Ejecutar el procedimiento almacenado
        const result = await pool.request()
            .input('SKU', sql.VarChar, SKU)
            .input('DESCRIPCION', sql.VarChar, DESCRIPCION)
            .input('MARCA', sql.Int, MARCA)
            .input('CATEGORIA', sql.Int, CATEGORIA)
            .input('SUBCATEGORIA', sql.Int, SUBCATEGORIA)
            .input('SSUBCATEGORIA', sql.Int, SSUBCATEGORIA)
            .input('BARRA', sql.BigInt, BARRA)
            .input('PRECIO', sql.Int, PRECIO)
            .input('EMPRESA', sql.Int, EMPRESA)
            .execute('CREA_ARTICULO'); // Procedimiento almacenado

        res.status(201).json({ message: 'Artículo creado exitosamente', result: result.recordset });
    } catch (error) {
        console.error('Error al crear el artículo:', error);
        res.status(500).json({ message: 'Error al crear el artículo', error: error.message });
    }
});




app.post('/api/consultarproducto', async (req, res) => {
    const { SKU, DES_SKU, MARCA, CATEGORIA, SUBCATEGORIA, SSUBCATEGORIA, BARRA, PRECIO, EMPRESA } = req.body;

    try {
        // Conexión a la base de datos
        const pool = await getConnection();

        // Ejecución del procedimiento almacenado para consultar el producto
        let result = await pool.request()
            .input('SKU', sql.Int, SKU || null)
            .input('DES_SKU', sql.VarChar(100), DES_SKU || null)
            .input('EMPRESA', sql.Int, EMPRESA || null)
            .execute('sp_ConsultarModificarProducto');  // Cambia al nombre adecuado del procedimiento de consulta

        // Verificamos si el producto fue encontrado
        if (result.recordset.length > 0) {
            res.status(200).json({
                message: 'Producto encontrado exitosamente',
                data: result.recordset
            });
        } else {
            res.status(404).json({
                message: 'Producto no encontrado',
                data: null
            });
        }
    } catch (err) {
        console.error('Error ejecutando el procedimiento almacenado:', err);
        res.status(500).json({ message: 'Error en el servidor', error: err.message });
    }
});







    // Endpoint para agregar un nuevo producto usando sp CREA empresa
    app.post('/api/crearEMPRESA', async (req, res) => {
        const { EMPRESA, NOM_EMPRESA,DIRECCION, TIENDA, TIENDA_NOMBRE,DIRECCION2 } = req.body;
        try {
            const pool = await getConnection();
    
            // Ejecutar :el procedimiento almacenado
            const result = await pool.request()
                .input('EMPRESA', sql.Int, EMPRESA)
                .input('NOM_EMPRESA', sql.VarChar, NOM_EMPRESA)
                .input('DIRECCION', sql.VarChar, DIRECCION)
                .input('TIENDA', sql.Int, TIENDA)
                .input('TIENDA_NOMBRE',sql.VarChar, TIENDA_NOMBRE)
                .input('DIRECCION2', sql.VarChar, DIRECCION2)
                .execute('CREA_EMPRESA'); // Procedimiento almacenado
    
            res.status(201).json({ message: 'Empresa y tienda creadas exitosamente', result: result.recordset });
        } catch (error) {
            console.error('Error al crear la empresa:', error);
            res.status(500).json({ message: 'Error al crear la empresa', error: error.message });
        }
    });



    // Endpoint para agregar un nuevo producto usando sp CREA empresa
    app.post('/api/crearTienda', async (req, res) => {
        const { EMPRESA,  TIENDA, TIENDA_NOMBRE,DIRECCION2 } = req.body;
        try {
            const pool = await getConnection();
    
            // Ejecutar :el procedimiento almacenado
            const result = await pool.request()
                .input('EMPRESA', sql.Int, EMPRESA)
                .input('TIENDA', sql.Int, TIENDA)
                .input('TIENDA_NOMBRE',sql.VarChar, TIENDA_NOMBRE)
                .input('DIRECCION2', sql.VarChar, DIRECCION2)
                .execute('CREA_TIENDA'); // Procedimiento almacenado
    
            res.status(201).json({ message: 'Tienda creadas exitosamente', result: result.recordset });
        } catch (error) {
            console.error('Error al crear la tienda:', error);
            res.status(500).json({ message: 'Error al crear la tienda', error: error.message });
        }
    });





    //PRUEBA

    // Ejemplo de API para obtener datos de una tabla en la base de datos
app.get('/api/obtenerDatos', async (req, res) => {
  
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM MARCA'); // Reemplaza con tu consulta
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error al obtener los datos:', error);
        res.status(500).json({ message: 'Error al obtener los datos', error: error.message });
    }
});



// Ruta para obtener un producto por el código de barras
app.get('/api/product/:codbarra', async (req, res) => {
    const {codbarra} = req.params;
    try {
      let pool = await sql.connect(config);
      let result = await pool.request()
        .input('codbarra', sql.BigInt, codbarra)
        .query('SELECT a.empresa, a.sku, a.des_sku, c.codbarra, a.marca, a.categoria FROM dbo.CODBARRA c inner join articulo a on c.empresa= a.empresa and c.sku=a.sku WHERE CODBARRA = @codbarra');
  
      if (result.recordset.length > 0) {
        res.json(result.recordset[0]);
      } else {
        res.status(404).send('Producto no encontrado');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Error en el servidor');
    }
  });
  



// Ruta para obtener los datos de las tablas por SKU y EMPRESA
app.get('/api/articulos/:sku/:empresa', async (req, res) => {
    const { sku, empresa } = req.params;

    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('SKU', sql.VarChar, sku)
            .input('EMPRESA', sql.Int, empresa)
            .query(`
                SELECT a.SKU, a.DES_SKU, a.MARCA, a.CATEGORIA, a.SUBCATEGORIA, a.SSUBCATEGORIA, c.CODBARRA, i.PRECIO_VENTA, a.EMPRESA
                FROM ARTICULO a
                INNER JOIN CODBARRA c ON a.EMPRESA = c.EMPRESA AND a.SKU = c.SKU
                INNER JOIN INV_UNIMEDARTICULO i ON a.EMPRESA = i.EMPRESA AND a.SKU = i.SKU
                WHERE a.SKU = @SKU AND a.EMPRESA = @EMPRESA;
            `);

        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).send('Producto no encontrado');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
});



// Endpoint para modificar un articulo en cualquier campo de las tablas 
app.put('/api/modificaarticulo', async (req, res) => {
    const { sku, empresa, DES_SKU, MARCA, CATEGORIA, SUBCATEGORIA, SSUBCATEGORIA, CODBARRA, PRECIO_VENTA } = req.body;

    try {
        let pool = await sql.connect(config);

        // Iniciar transacción
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Modificación en la tabla ARTICULO
            await transaction.request()
                .input('SKU', sql.VarChar, sku)
                .input('EMPRESA', sql.Int, empresa)
                .input('DES_SKU', sql.VarChar, DES_SKU || null)
                .input('MARCA', sql.Int, MARCA || null)
                .input('CATEGORIA', sql.Int, CATEGORIA || null)
                .input('SUBCATEGORIA', sql.Int, SUBCATEGORIA || null)
                .input('SSUBCATEGORIA', sql.Int, SSUBCATEGORIA || null)
                .query(`
                    UPDATE ARTICULO
                    SET 
                        DES_SKU = COALESCE(@DES_SKU, DES_SKU),
                        MARCA = COALESCE(@MARCA, MARCA),
                        CATEGORIA = COALESCE(@CATEGORIA, CATEGORIA),
                        SUBCATEGORIA = COALESCE(@SUBCATEGORIA, SUBCATEGORIA),
                        SSUBCATEGORIA = COALESCE(@SSUBCATEGORIA, SSUBCATEGORIA)
                    WHERE SKU = @SKU AND EMPRESA = @EMPRESA;
                `);

            // Modificación en la tabla CODBARRA
            await transaction.request()
                .input('SKU', sql.VarChar, sku)
                .input('EMPRESA', sql.Int, empresa)
                .input('CODBARRA', sql.BigInt, CODBARRA || null)
                .query(`
                    UPDATE CODBARRA
                    SET CODBARRA = COALESCE(@CODBARRA, CODBARRA)
                    WHERE SKU = @SKU AND EMPRESA = @EMPRESA;
                `);

            // Modificación en la tabla INV_UNIMEDARTICULO
            await transaction.request()
                .input('SKU', sql.VarChar, sku)
                .input('EMPRESA', sql.Int, empresa)
                .input('PRECIO_VENTA', sql.Decimal(18, 2), PRECIO_VENTA || null)  // Asegúrate de que el tipo de dato sea correcto
                .query(`
                    UPDATE INV_UNIMEDARTICULO
                    SET PRECIO_VENTA = COALESCE(@PRECIO_VENTA, PRECIO_VENTA)
                    WHERE SKU = @SKU AND EMPRESA = @EMPRESA;
                `);

            // Si todo sale bien, hacer commit a la transacción
            await transaction.commit();

            res.json({ message: 'Producto actualizado exitosamente' });

        } catch (updateError) {
            // Si algo falla, hacer rollback
            await transaction.rollback();
            console.error('Error durante la actualización:', updateError);
            res.status(500).json({ error: 'Error durante la actualización del producto' });
        }

    } catch (err) {
        console.error('Error en la conexión:', err);
        res.status(500).json({ error: 'Error al conectar con la base de datos' });
    }
});




// Ruta para obtener estadísticas
app.get('/api/estadisticasarticulo', async (req, res) => {
    try {
        await sql.connect(config);
        const result = await sql.query('SELECT COUNT(*) as totalProductos FROM articulo');
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en la base de datos');
    }
});



app.get('/api/estadisticaprecio', async (req, res) => {
    try {
        await sql.connect(config);
        const result = await sql.query('SELECT  AVG(PRECIO_VENTA) as precioPromedio FROM INV_UNIMEDARTICULO');
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en la base de datos');
    }
});


// Obtener reporte de productos
app.get('/api/reportes/productos', async (req, res) => {
    try {
      await sql.connect(config);
      const result = await sql.query(`
                SELECT a.SKU, a.DES_SKU, a.MARCA, a.CATEGORIA, a.SUBCATEGORIA, a.SSUBCATEGORIA, c.CODBARRA, i.PRECIO_VENTA, a.EMPRESA
                FROM ARTICULO a
                INNER JOIN CODBARRA c ON a.EMPRESA = c.EMPRESA AND a.SKU = c.SKU
                INNER JOIN INV_UNIMEDARTICULO i ON a.EMPRESA = i.EMPRESA AND a.SKU = i.SKU`);
      res.json(result.recordset);
    } catch (err) {
      res.status(500).send('Error al obtener el reporte de productos: ' + err.message);
    }
  });





  // Obtener reporte de productos
app.get('/api/reportes/empresatienda', async (req, res) => {
    await sql.connect(config);
    const { empresa } = req.params;

    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('EMPRESA', sql.Int, empresa)
            .query(`
                SELECT e.EMPRESA, e.NOM_EMPRESA, e.DIRECCION, t.TIENDA, t.NOM_TIENDA, t.DIRECCION as Direccion_tda  FROM EMPRESA e 
                INNER JOIN TIENDA t on 
                e.EMPRESA=t.EMPRESA 
                WHERE e.EMPRESA=@EMPRESA 
                `);
      res.json(result.recordset);
    } catch (err) {
      res.status(500).send('Error al obtener el reporte de productos: ' + err.message);
    }
  });




  
  // Obtener reporte de productos
app.get('/api/etiqueta', async (req, res) => {
    try {
      await sql.connect(config);
      const result = await sql.query(`
             SELECT a.sku, a.DES_SKU, a.MARCA, c.CODBARRA, i.PRECIO_VENTA FROM ARTICULO a 
             INNER JOIN CODBARRA c on 
             a.EMPRESA=c.EMPRESA and a.SKU=c.SKU
             INNER JOIN INV_UNIMEDARTICULO i on 
             c.EMPRESA=i.EMPRESA and c.SKU=i.EMPRESA 
             INNER JOIN TIENDA t on 
             i.EMPRESA=t.EMPRESA and i.LISTA_TIENDA=t.LISTA_TIENDA
             
 `);
      res.json(result.recordset);
    } catch (err) {
      res.status(500).send('Error al obtener el reporte de productos: ' + err.message);
    }
  });


//reporte de empresa 
  app.get('/api/empresatienda2/:empresa', async (req, res) => {
    const { empresa } = req.params; // Aquí usamos req.params para obtener el parámetro de la ruta

    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('EMPRESA', sql.Int, empresa) 
            .query(`
                SELECT e.EMPRESA, e.NOM_EMPRESA, e.DIRECCION, t.TIENDA, t.NOM_TIENDA, t.DIRECCION as Direccion_tda  
                FROM EMPRESA e 
                INNER JOIN TIENDA t on e.EMPRESA = t.EMPRESA 
                WHERE e.EMPRESA = @EMPRESA
            `);

        res.json(result.recordset);
    } catch (err) {
        res.status(500).send('Error al obtener el reporte de tiendas: ' + err.message);
    }
});

// Obtener reporte de productos
app.get('/api/productos/:empresa', async (req, res) => {
    const { empresa } = req.params;

    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
       .input('EMPRESA', sql.Int, empresa) 
      .query(`
                SELECT a.SKU, a.DES_SKU, a.MARCA, a.CATEGORIA, a.SUBCATEGORIA, a.SSUBCATEGORIA, c.CODBARRA, i.PRECIO_VENTA, a.EMPRESA
                FROM ARTICULO a
                INNER JOIN CODBARRA c ON
                 a.EMPRESA = c.EMPRESA AND a.SKU = c.SKU
                INNER JOIN INV_UNIMEDARTICULO i ON 
                a.EMPRESA = i.EMPRESA AND a.SKU = i.SKU AND c.empresa=i.empresa AND c.SKU=i.SKU
                WHERE a.EMPRESA=@EMPRESA
                GROUP BY a.SKU, a.DES_SKU, a.MARCA, a.CATEGORIA, a.SUBCATEGORIA, a.SSUBCATEGORIA, c.CODBARRA, i.PRECIO_VENTA, a.EMPRESA`);
      res.json(result.recordset);
    } catch (err) {
      res.status(500).send('Error al obtener el reporte de productos: ' + err.message);
    }
  });



// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});