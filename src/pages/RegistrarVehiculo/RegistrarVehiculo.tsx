import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RegistrarVehiculo.css";
import { guardarVehiculo, actualizarVehiculo } from "../../bd/vehiculosBD";
import { VehicleModal } from "../Users/components/Modal/Modal";
import { validateField, validateVehicleForm } from "../../pages/RegistrarVehiculo/utils/validations";
import { useLocation } from "react-router-dom";

const RegistrarVehiculo = () => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const location = useLocation();
    const vehiculoEditado = location.state?.vehiculo;

    const [fieldErrors, setFieldErrors] = useState<{
        tipo?: string;
        placa?: string;
        marca?: string;
        modelo?: string;
        color?: string;
        fotoDelantera?: string;
        fotoTrasera?: string;
    }>({});

    const delanteraRef = useRef<HTMLInputElement>(null);
    const traseraRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        tipo: vehiculoEditado?.tipo || "",
        placa: vehiculoEditado?.placa || "",
        marca: vehiculoEditado?.marca || "",
        modelo: vehiculoEditado?.modelo || "",
        color: vehiculoEditado?.color || "",
    });

    const [delanteraPreview, setDelanteraPreview] = useState<string | null>(
        vehiculoEditado?.fotoDelantera || null
    );
    const [traseraPreview, setTraseraPreview] = useState<string | null>(
        vehiculoEditado?.fotoTrasera || null
    );

    const handleImageChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        setPreview: React.Dispatch<React.SetStateAction<string | null>>,
        fieldName: string
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                const base64WithoutPrefix = base64String.split(",")[1] || "";
                setPreview(base64WithoutPrefix);
                setFieldErrors(prevErrors => ({
                    ...prevErrors,
                    [fieldName]: "",
                }));
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
            setFieldErrors(prevErrors => ({
                ...prevErrors,
                [fieldName]: "Se requiere una imagen.",
            }));
        }
    };

    const handleSave = async () => {
        const currentFieldErrors = validateVehicleForm(formData, delanteraPreview, traseraPreview);
        setFieldErrors(currentFieldErrors);

        const hasErrors = Object.values(currentFieldErrors).some(error => error !== "");

        if (hasErrors) {
            setErrorMessage("Por favor, corrija los errores en el formulario antes de guardar.");
            return;
        }

        if (delanteraPreview === null || traseraPreview === null) {
            setErrorMessage("Las imágenes delantera y trasera son requeridas.");
            return;
        }

        const data = {
            ...formData,
            fotoDelantera: delanteraPreview,
            fotoTrasera: traseraPreview,
        };

        try {
            if (vehiculoEditado?.id) {
                await actualizarVehiculo(vehiculoEditado.id, data);
                console.log("Vehículo actualizado exitosamente.");
            } else {
                await guardarVehiculo(data);
                console.log("Vehículo guardado exitosamente.");
            }
            navigate("/registrar/usuario");
        } catch (error) {
            setErrorMessage(String(error));
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        const error = validateField(name, value);
        setFieldErrors(prevErrors => ({
            ...prevErrors,
            [name]: error,
        }));
    };

    return (
        <section className="registrarVehiculo">
            <h2 className="registrarVehiculo__title">REGISTRAR VEHICULO</h2>

            <form className="registrarVehiculo__form">
                <div className="registrarVehiculo__form-left">
                    <fieldset>
                        <div className="registrarVehiculo__input-group">
                            <label>Tipo Vehículo: <span className="registrarVehiculo__required">*</span></label>
                            <select name="tipo" value={formData.tipo} onChange={handleInputChange} required>
                                <option value="">Seleccione</option>
                                <option value="Auto">Automóvil</option>
                                <option value="Moto">Motocicleta</option>
                            </select>
                            {fieldErrors.tipo && <p className="vehicle__error-message">{fieldErrors.tipo}</p>}
                        </div>
                        <div className="registrarVehiculo__input-group">
                            <label>Placa: <span className="registrarVehiculo__required">*</span></label>
                            <input type="text" name="placa" value={formData.placa} onChange={handleInputChange} maxLength={10} required />
                            {fieldErrors.placa && <p className="vehicle__error-message">{fieldErrors.placa}</p>}
                        </div>
                        <div className="registrarVehiculo__input-group">
                            <label>Marca: <span className="registrarVehiculo__required">*</span></label>
                            <input type="text" name="marca" value={formData.marca} onChange={handleInputChange} required />
                            {fieldErrors.marca && <p className="vehicle__error-message">{fieldErrors.marca}</p>}
                        </div>
                        <div className="registrarVehiculo__input-group">
                            <label>Modelo: <span className="registrarVehiculo__required">*</span></label>
                            <input type="text" name="modelo" value={formData.modelo} onChange={handleInputChange} required />
                            {fieldErrors.modelo && <p className="vehicle__error-message">{fieldErrors.modelo}</p>}
                        </div>
                        <div className="registrarVehiculo__input-group">
                            <label>Color: <span className="registrarVehiculo__required">*</span></label>
                            <input type="text" name="color" value={formData.color} onChange={handleInputChange} required />
                            {fieldErrors.color && <p className="vehicle__error-message">{fieldErrors.color}</p>}
                        </div>
                    </fieldset>
                </div>

                <div className="registrarVehiculo__form-right">
                    <div className="registrarVehiculo__input-group">
                        <label>Foto vehículo delantera: <span className="registrarVehiculo__required">*</span></label>
                        <div className="registrarVehiculo__upload-box">
                            {delanteraPreview ? (
                                <img
                                    src={`data:image/jpeg;base64,${delanteraPreview}`}
                                    alt="Foto delantera"
                                    onClick={() => delanteraRef.current?.click()}
                                    className="registrarVehiculo__photo-preview"
                                />
                            ) : (
                                <button type="button" onClick={() => delanteraRef.current?.click()}>Subir Foto</button>
                            )}
                            <input
                                type="file"
                                ref={delanteraRef}
                                onChange={(e) => handleImageChange(e, setDelanteraPreview, "fotoDelantera")}
                                style={{ display: "none" }}
                                accept="image/*"
                            />
                            {fieldErrors.fotoDelantera && <p className="vehicle__error-message">{fieldErrors.fotoDelantera}</p>}
                        </div>
                    </div>

                    <div className="registrarVehiculo__input-group">
                        <label>Foto vehículo trasera: <span className="registrarVehiculo__required">*</span></label>
                        <div className="registrarVehiculo__upload-box">
                            {traseraPreview ? (
                                <img
                                    src={`data:image/jpeg;base64,${traseraPreview}`}
                                    alt="Foto trasera"
                                    onClick={() => traseraRef.current?.click()}
                                    className="registrarVehiculo__photo-preview"
                                />
                            ) : (
                                <button type="button" onClick={() => traseraRef.current?.click()} className="registrarVehiculo__upload-button">Subir Foto</button>
                            )}
                            <input
                                type="file"
                                ref={traseraRef}
                                onChange={(e) => handleImageChange(e, setTraseraPreview, "fotoTrasera")}
                                style={{ display: "none" }}
                                accept="image/*"
                            />
                            {fieldErrors.fotoTrasera && <p className="vehicle__error-message">{fieldErrors.fotoTrasera}</p>}
                        </div>
                    </div>
                </div>
            </form>

            <div className="registrarVehiculo__actions">
                <button type="button" className="registrarVehiculo__cancel-button" onClick={() => navigate("/registrar/usuario")}>CANCELAR</button>
                <button type="button" className="registrarVehiculo__submit-button" onClick={handleSave}>GUARDAR</button>
            </div>

            {errorMessage && (
                <VehicleModal message={errorMessage} onClose={() => setErrorMessage(null)} />
            )}
        </section>
    );
};

export default RegistrarVehiculo;