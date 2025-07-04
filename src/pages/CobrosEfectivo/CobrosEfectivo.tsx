import React, { useEffect, useState } from "react";
import "./CobrosEfectivo.css";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

type Cliente = {
  id: string;
  ci: string;
  nombre: string;
  apellido: string;
  tipo: string;
};

const getNombreCompleto = (cliente: Cliente) =>
  `${cliente.nombre} ${cliente.apellido}`;

const CobrosEfectivo: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busquedaNombre, setBusquedaNombre] = useState("");
  const [busquedaCi, setBusquedaCi] = useState("");
  const [resultados, setResultados] = useState<Cliente[]>([]);
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const obtenerClientes = async () => {
      try {
        const res = await axiosPrivate.get(
          "/cliente/activos",
        );
        console.log(res.data);
        if (Array.isArray(res.data.data)) {
          setClientes(res.data.data);
        } else {
          console.error(
            'La respuesta no contiene un array de clientes en "data"',
          );
        }
      } catch (err) {
        console.error("Error al obtener clientes:", err);
      }
    };

    obtenerClientes();
  }, []);

  useEffect(() => {
    let filtrados: Cliente[] = [];

    if (busquedaNombre) {
      filtrados = clientes.filter((cliente) =>
        `${cliente.nombre} ${cliente.apellido}`.toLowerCase().startsWith(
          busquedaNombre.toLowerCase(),
        )
      );
      console.log(filtrados);
    } else if (busquedaCi) {
      filtrados = clientes.filter((cliente) =>
        cliente.ci.toLowerCase().startsWith(busquedaCi.toLowerCase())
      );
    }

    setResultados(filtrados);
  }, [busquedaNombre, busquedaCi, clientes]);

  return (
    <div className="contenidoCobro">
      <div className="titulo">
        <h1>REALIZAR COBRO</h1>
      </div>

      <div className="buscar-contenido">
        <label className="etiqueta">Buscar por nombre:</label>
        <div className="input-con-icono">
          <img
            src="/src/assets/icons/Search.svg"
            alt="Buscar"
            className="icono-lupa"
          />
          <input
            type="text"
            className="BuscadorNombre"
            placeholder="Buscar..."
            value={busquedaNombre}
            onChange={(e) => {
              setBusquedaNombre(e.target.value);
              setBusquedaCi("");
            }}
          />
        </div>
      </div>

      <div>
        <p>o</p>
      </div>

      <div className="buscar-contenido">
        <label className="etiqueta">Buscar por C.I.:</label>
        <div className="input-con-icono">
          <img
            src="/src/assets/icons/Search.svg"
            alt="Buscar"
            className="icono-lupa"
          />
          <input
            type="text"
            className="BuscadorCi"
            placeholder="Buscar..."
            value={busquedaCi}
            onChange={(e) => {
              setBusquedaCi(e.target.value);
              setBusquedaNombre("");
            }}
          />
        </div>
      </div>

      {(busquedaNombre || busquedaCi) && (
        <div className="resultados">
          <h3>Resultados:</h3>
          {resultados.length > 0
            ? (
              <div className="tarjeta-usuario" style={{ cursor: "pointer" }}>
                <table className="table">
                  <tbody>
                    {Array.from(
                      new Map(resultados.map((c) => [c.ci, c])).values(),
                    ).map((cliente) => (
                      <tr
                        key={cliente.id}
                        onClick={() =>
                          navigate("/cobros/Formulario", {
                            state: { cliente },
                          })}
                      >
                        <td className="icono-usuario">
                          <img
                            src="/icons/user.png"
                            alt="Usuario"
                            className="imagen-usuario"
                          />
                        </td>
                        <td>
                          <div>
                            <b>{getNombreCompleto(cliente)}</b>
                          </div>
                          <div>
                            <small>C.I. {cliente.ci} - {cliente.tipo}</small>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
            : <p>No se encontraron resultados.</p>}
        </div>
      )}
    </div>
  );
};

export default CobrosEfectivo;
