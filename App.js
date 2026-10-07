import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Pressable,
  Image,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Accelerometer } from 'expo-sensors';

// Importación única de componente externo
import ExploracionCamara from './ExploracionCamara';

/* =========================================================
   DATOS BASE DEL LABORATORIO
========================================================= */

const TOTAL_PRODUCTOS = 120;

const imagenes = [
  'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=500',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500',
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500',
];

const productos = Array.from({ length: TOTAL_PRODUCTOS }, (_, index) => ({
  id: index + 1,
  nombre: `Producto ${index + 1}`,
  descripcion: 'Producto de demostración para el laboratorio',
  categoria:
    index % 3 === 0
      ? 'Comida'
      : index % 3 === 1
      ? 'Bebida'
      : 'Especial',
  precio: 15000 + (index % 10) * 2500,
  imagen: imagenes[index % imagenes.length],
}));

/* =========================================================
   COMPONENTE PRINCIPAL
========================================================= */

export default function App() {
  const [pestana, setPestana] = useState('adaptativa');

  return (
    <View style={styles.app}>
      <StatusBar style="light" />

      {pestana === 'original' && (
        <PantallaOriginal pestana={pestana} setPestana={setPestana} />
      )}

      {pestana === 'optimizada' && (
        <PantallaOptimizada pestana={pestana} setPestana={setPestana} />
      )}

      {pestana === 'adaptativa' && (
        <PantallaAdaptativa pestana={pestana} setPestana={setPestana} />
      )}

      {pestana === 'sensores' && (
        <PantallaSensores pestana={pestana} setPestana={setPestana} />
      )}

      {pestana === 'camara' && (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.contenido}>
            <EncabezadoAdaptativo />
            <Navegacion pestana={pestana} setPestana={setPestana} />
            <View style={styles.tituloSeccion}>
              <Text style={styles.tituloSeccionTexto}>Exploración de Cámara</Text>
              <Text style={styles.descripcionSeccion}>
                Módulo externo que gestiona permisos y visor en vivo.
              </Text>
            </View>
            <ExploracionCamara />
          </ScrollView>
        </View>
      )}
    </View>
  );
}

/* =========================================================
   ENCABEZADO
========================================================= */

function EncabezadoAdaptativo() {
  const { width } = useWindowDimensions();
  const esMovil = width < 600;

  return (
    <View style={[styles.header, esMovil && styles.headerMovil]}>
      <View style={styles.headerTexto}>
        <Text style={styles.etiqueta}>LABORATORIO DE HARDWARE & RENDIMIENTO</Text>
        <Text style={[styles.titulo, esMovil && styles.tituloMovil]}>
          Rendimiento & Sensores
        </Text>
        <Text style={styles.subtitulo}>Sesión 5 · Acelerómetro y Cámara</Text>
      </View>

      <View style={[styles.contador, esMovil && styles.contadorMovil]}>
        <Text style={styles.contadorNumero}>{TOTAL_PRODUCTOS}</Text>
        <Text style={styles.contadorTexto}>ITEMS</Text>
      </View>
    </View>
  );
}

/* =========================================================
   NAVEGACIÓN (5 PESTAÑAS)
========================================================= */

function Navegacion({ pestana, setPestana }) {
  const { width } = useWindowDimensions();
  const esMovil = width < 768;

  return (
    <View style={[styles.tabs, esMovil && styles.tabsMovil]}>
      <BotonTab
        activo={pestana === 'original'}
        icono="🐌"
        titulo="Original"
        subtitulo="ScrollView"
        onPress={() => setPestana('original')}
        movil={esMovil}
      />
      <BotonTab
        activo={pestana === 'optimizada'}
        icono="⚡"
        titulo="Optimizada"
        subtitulo="FlatList"
        onPress={() => setPestana('optimizada')}
        movil={esMovil}
      />
      <BotonTab
        activo={pestana === 'adaptativa'}
        icono="🧮"
        titulo="Adaptativa"
        subtitulo="Responsive"
        onPress={() => setPestana('adaptativa')}
        movil={esMovil}
      />
      <BotonTab
        activo={pestana === 'sensores'}
        icono="📡"
        titulo="Sensores"
        subtitulo="Acelerómetro"
        onPress={() => setPestana('sensores')}
        movil={esMovil}
      />
      <BotonTab
        activo={pestana === 'camara'}
        icono="📷"
        titulo="Cámara"
        subtitulo="CameraView"
        onPress={() => setPestana('camara')}
        movil={esMovil}
      />
    </View>
  );
}

function BotonTab({ activo, icono, titulo, subtitulo, onPress, movil }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.tab,
        activo && styles.tabActivo,
        movil && styles.tabMovil,
      ]}
    >
      <Text style={styles.tabIcono}>{icono}</Text>
      <View>
        <Text style={styles.tabTitulo}>{titulo}</Text>
        <Text style={styles.tabSubtitulo}>{subtitulo}</Text>
      </View>
    </Pressable>
  );
}

/* =========================================================
   PANTALLA SENSORES (DENTRO DE APP.JS)
========================================================= */

function PantallaSensores({ pestana, setPestana }) {
  const [modoSimulado, setModoSimulado] = useState(Platform.OS === 'web');
  const [sensorDisponible, setSensorDisponible] = useState(true);
  const [sensorActivo, setSensorActivo] = useState(true);
  const [datosReales, setDatosReales] = useState({ x: 0, y: 0, z: 0 });
  const [datosSimulados, setDatosSimulados] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    let suscripcion = null;

    async function validarYSuscribir() {
      if (Platform.OS === 'web') {
        setSensorDisponible(false);
        setModoSimulado(true);
        return;
      }

      const disponible = await Accelerometer.isAvailableAsync();
      setSensorDisponible(disponible);

      if (!disponible) {
        setModoSimulado(true);
        return;
      }

      if (!modoSimulado && sensorActivo) {
        Accelerometer.setUpdateInterval(500);
        suscripcion = Accelerometer.addListener((medicion) => {
          setDatosReales(medicion);
        });
      }
    }

    validarYSuscribir();

    return () => {
      if (suscripcion) {
        suscripcion.remove();
      }
    };
  }, [modoSimulado, sensorActivo]);

  const datosActuales = modoSimulado ? datosSimulados : datosReales;
  const { x, y, z } = datosActuales;

  let orientacionTexto = 'Centro';
  let alineacionIndicador = 'center';

  if (x > 0.5) {
    orientacionTexto = 'Inclinado a la Derecha';
    alineacionIndicador = 'flex-end';
  } else if (x < -0.5) {
    orientacionTexto = 'Inclinado a la Izquierda';
    alineacionIndicador = 'flex-start';
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <EncabezadoAdaptativo />
        <Navegacion pestana={pestana} setPestana={setPestana} />

        <View style={styles.tituloSeccion}>
          <Text style={styles.tituloSeccionTexto}>Módulo de Acelerómetro</Text>
          <Text style={styles.descripcionSeccion}>
            Lectura triaxial con intervalo de 500 ms y opción de simulación.
          </Text>
        </View>

        <View
          style={[
            styles.bannerSensor,
            modoSimulado ? styles.bannerSimulado : styles.bannerReal,
          ]}
        >
          <Text style={styles.bannerIcono}>{modoSimulado ? '🧪' : '📱'}</Text>
          <View style={styles.bannerTextos}>
            <Text style={styles.bannerTitulo}>
              {modoSimulado ? 'MODO SIMULADO ACTIVO' : 'MODO REAL (HARDWARE)'}
            </Text>
            <Text style={styles.bannerSubtitulo}>
              {!sensorDisponible
                ? 'Acelerómetro no disponible o plataforma Web detectada.'
                : modoSimulado
                ? 'Valores controlados manualmente por software.'
                : sensorActivo
                ? 'Escuchando eventos del sensor nativo.'
                : 'Escucha pausada intencionalmente (Mejora D).'}
            </Text>
          </View>
        </View>

        <View style={styles.tarjetaSensor}>
          <Text style={styles.sensorSubcabecera}>INDICADOR DE INCLINACIÓN (EJE X)</Text>
          <Text style={styles.sensorEstadoGrande}>{orientacionTexto}</Text>

          <View style={styles.pistaNivel}>
            <View style={[styles.pistaContenedor, { alignItems: alineacionIndicador }]}>
              <View style={styles.burbujaNivel}>
                <Text style={styles.burbujaTexto}>X</Text>
              </View>
            </View>
          </View>

          <View style={styles.lecturasEjes}>
            <View style={styles.ejeCaja}>
              <Text style={styles.ejeEtiqueta}>Eje X</Text>
              <Text style={styles.ejeValor}>{x.toFixed(2)}</Text>
            </View>
            <View style={styles.ejeCaja}>
              <Text style={styles.ejeEtiqueta}>Eje Y</Text>
              <Text style={styles.ejeValor}>{y.toFixed(2)}</Text>
            </View>
            <View style={styles.ejeCaja}>
              <Text style={styles.ejeEtiqueta}>Eje Z</Text>
              <Text style={styles.ejeValor}>{z.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {!modoSimulado && sensorDisponible && (
          <View style={styles.bloqueMejora}>
            <Text style={styles.mejoraTitulo}>Control de Hardware (Mejora D)</Text>
            <Pressable
              style={[
                styles.botonAccion,
                sensorActivo ? styles.botonPausar : styles.botonReanudar,
              ]}
              onPress={() => setSensorActivo((prev) => !prev)}
            >
              <Text style={styles.botonAccionTexto}>
                {sensorActivo ? '⏸ Pausar Sensor' : '▶ Reanudar Sensor'}
              </Text>
            </Pressable>
          </View>
        )}

        <View style={styles.panelSimulacion}>
          <Text style={styles.simulacionTitulo}>Controles de Simulación</Text>
          <Text style={styles.simulacionDescripcion}>
            Ajusta los ejes sin depender de hardware físico.
          </Text>

          <View style={styles.botonesFila}>
            <Pressable
              style={styles.btnSimular}
              onPress={() => {
                setModoSimulado(true);
                setDatosSimulados({ x: -0.85, y: 0.12, z: 0.54 });
              }}
            >
              <Text style={styles.btnSimularTexto}>⬅ Izquierda</Text>
            </Pressable>

            <Pressable
              style={styles.btnSimular}
              onPress={() => {
                setModoSimulado(true);
                setDatosSimulados({ x: 0.02, y: 0.05, z: 0.98 });
              }}
            >
              <Text style={styles.btnSimularTexto}>⏺ Centro</Text>
            </Pressable>

            <Pressable
              style={styles.btnSimular}
              onPress={() => {
                setModoSimulado(true);
                setDatosSimulados({ x: 0.88, y: -0.15, z: 0.45 });
              }}
            >
              <Text style={styles.btnSimularTexto}>Derecha ➡</Text>
            </Pressable>
          </View>

          {sensorDisponible && Platform.OS !== 'web' && (
            <Pressable
              style={styles.btnAlternarModo}
              onPress={() => setModoSimulado((prev) => !prev)}
            >
              <Text style={styles.btnAlternarTexto}>
                {modoSimulado ? 'Cambiar a Modo Real (Hardware)' : 'Cambiar a Modo Simulado'}
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

/* =========================================================
   PANTALLA ORIGINAL (ScrollView)
========================================================= */

function PantallaOriginal({ pestana, setPestana }) {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <EncabezadoAdaptativo />
        <Navegacion pestana={pestana} setPestana={setPestana} />

        <View style={styles.tituloSeccion}>
          <Text style={styles.tituloSeccionTexto}>Lista original</Text>
          <Text style={styles.descripcionSeccion}>
            ScrollView renderiza todos los elementos.
          </Text>
        </View>

        <View style={styles.alertaOriginal}>
          <Text style={styles.alertaIcono}>⚠️</Text>
          <View style={styles.alertaTexto}>
            <Text style={styles.alertaTitulo}>Sin virtualización</Text>
            <Text style={styles.alertaDescripcion}>
              Los {TOTAL_PRODUCTOS} productos se cargan al mismo tiempo.
            </Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {productos.map((producto) => (
            <ProductoCard key={producto.id} producto={producto} />
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
}

/* =========================================================
   PANTALLA OPTIMIZADA (FlatList)
========================================================= */

function PantallaOptimizada({ pestana, setPestana }) {
  const [montados, setMontados] = useState(0);

  const registrarMontaje = () => {
    setMontados((actual) => {
      if (actual >= 36) return actual;
      return actual + 1;
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={productos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ProductoCard producto={item} onMount={registrarMontaje} />
        )}
        ListHeaderComponent={
          <View>
            <EncabezadoAdaptativo />
            <Navegacion pestana={pestana} setPestana={setPestana} />
            <View style={styles.tituloSeccion}>
              <Text style={styles.tituloSeccionTexto}>Lista optimizada</Text>
              <Text style={styles.descripcionSeccion}>
                FlatList utiliza virtualización.
              </Text>
            </View>
            <Metricas montados={montados} porcentaje="30%" />
          </View>
        }
        contentContainerStyle={styles.contenido}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

/* =========================================================
   PANTALLA ADAPTATIVA (Responsive Columns)
========================================================= */

function PantallaAdaptativa({ pestana, setPestana }) {
  const { width } = useWindowDimensions();
  const esMovil = width < 600;

  const columnas = width >= 1100 ? 3 : width >= 720 ? 2 : 1;
  const porcentaje = columnas === 3 ? '30%' : columnas === 2 ? '45%' : '60%';

  return (
    <View style={styles.container}>
      <FlatList
        data={productos}
        key={`lista-${columnas}`}
        numColumns={columnas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TarjetaAdaptativa producto={item} columnas={columnas} />
        )}
        ListHeaderComponent={
          <View>
            <EncabezadoAdaptativo />
            <Navegacion pestana={pestana} setPestana={setPestana} />
            <View style={[styles.metricas, esMovil && styles.metricasMovil]}>
              <MetricCard
                icono="🧠"
                titulo="Elementos montados"
                numero="36"
                descripcion="Elementos virtualizados"
              />
              <MetricCard
                icono="💾"
                titulo="Carga estimada"
                numero="30%"
                descripcion="Menor trabajo simultáneo"
              />
            </View>

            <View style={styles.recursos}>
              <View style={styles.recursosHeader}>
                <Text style={styles.recursosTitulo}>Uso de recursos</Text>
                <Text style={styles.recursosPorcentaje}>{porcentaje}</Text>
              </View>
              <View style={styles.barra}>
                <View style={[styles.barraProgreso, { width: porcentaje }]} />
              </View>
              <Text style={styles.recursosDescripcion}>
                FlatList adapta la cantidad de columnas al tamaño de la pantalla.
              </Text>
            </View>

            <View style={[styles.diseno, esMovil && styles.disenoMovil]}>
              <View style={styles.disenoTexto}>
                <Text style={styles.disenoTitulo}>Diseño adaptativo</Text>
                <Text style={styles.disenoDescripcion}>
                  La interfaz se adapta automáticamente
                </Text>
              </View>
              <View style={styles.resolucion}>
                <Text style={styles.resolucionNumero}>{Math.round(width)} px</Text>
                <Text style={styles.resolucionTexto}>
                  {columnas} {columnas === 1 ? 'columna' : 'columnas'}
                </Text>
              </View>
            </View>
          </View>
        }
        contentContainerStyle={styles.contenido}
        initialNumToRender={columnas === 1 ? 6 : 12}
        maxToRenderPerBatch={columnas === 1 ? 6 : 12}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        columnWrapperStyle={columnas > 1 ? styles.fila : undefined}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

/* =========================================================
   TARJETAS Y AUXILIARES
========================================================= */

function Metricas({ montados, porcentaje }) {
  return (
    <View style={styles.metricas}>
      <MetricCard
        icono="🧠"
        titulo="Elementos montados"
        numero={montados}
        descripcion="Elementos virtualizados"
      />
      <MetricCard
        icono="💾"
        titulo="Carga estimada"
        numero={porcentaje}
        descripcion="Menor trabajo simultáneo"
      />
    </View>
  );
}

function MetricCard({ icono, titulo, numero, descripcion }) {
  return (
    <View style={styles.metrica}>
      <Text style={styles.metricaIcono}>{icono}</Text>
      <Text style={styles.metricaTitulo}>{titulo}</Text>
      <Text style={styles.metricaNumero}>{numero}</Text>
      <Text style={styles.metricaDescripcion}>{descripcion}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeTexto}>OPTIMIZADO</Text>
      </View>
    </View>
  );
}

function ProductoCard({ producto, onMount }) {
  useEffect(() => {
    if (onMount) onMount();
  }, []);

  return (
    <View style={styles.producto}>
      <Image source={{ uri: producto.imagen }} style={styles.productoImagen} />
      <View style={styles.productoInfo}>
        <Text style={styles.productoNombre}>{producto.nombre}</Text>
        <Text style={styles.productoDescripcion}>{producto.descripcion}</Text>
        <Text style={styles.productoCategoria}>{producto.categoria}</Text>
        <Text style={styles.productoPrecio}>
          ${producto.precio.toLocaleString('es-CO')}
        </Text>
      </View>
    </View>
  );
}

function TarjetaAdaptativa({ producto, columnas }) {
  return (
    <View
      style={[
        styles.tarjetaAdaptativa,
        columnas === 1 && styles.tarjetaUnaColumna,
        columnas === 2 && styles.tarjetaDosColumnas,
        columnas === 3 && styles.tarjetaTresColumnas,
      ]}
    >
      <Image
        source={{ uri: producto.imagen }}
        style={[
          styles.imagenAdaptativa,
          columnas === 1 && styles.imagenUnaColumna,
        ]}
      />
      <View style={styles.adaptativaInfo}>
        <Text style={styles.adaptativaNombre} numberOfLines={1}>
          {producto.nombre}
        </Text>
        <Text style={styles.adaptativaCategoria}>{producto.categoria}</Text>
        <Text style={styles.adaptativaPrecio}>
          ${producto.precio.toLocaleString('es-CO')}
        </Text>
      </View>
    </View>
  );
}

/* =========================================================
   ESTILOS GENERALES
========================================================= */

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: '#070B14' },
  container: { flex: 1, backgroundColor: '#070B14' },
  contenido: {
    paddingTop: Platform.OS === 'android' ? 35 : 20,
    paddingHorizontal: 14,
    paddingBottom: 40,
  },
  header: {
    minHeight: 95,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingBottom: 15,
  },
  headerMovil: { alignItems: 'flex-start' },
  headerTexto: { flex: 1, paddingRight: 10 },
  etiqueta: {
    color: '#00E5FF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 7,
  },
  titulo: { color: '#FFFFFF', fontSize: 24, fontWeight: '900' },
  tituloMovil: { fontSize: 20 },
  subtitulo: { color: '#7D8799', fontSize: 12, marginTop: 5 },
  contador: {
    width: 58,
    height: 58,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#00D9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contadorMovil: { width: 50, height: 50 },
  contadorNumero: { color: '#00E5FF', fontSize: 16, fontWeight: '900' },
  contadorTexto: { color: '#7D8799', fontSize: 7, fontWeight: '700' },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#0C111D',
    borderWidth: 1,
    borderColor: '#202938',
    borderRadius: 14,
    padding: 5,
    marginBottom: 10,
  },
  tabsMovil: { flexDirection: 'column' },
  tab: {
    flex: 1,
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderRadius: 10,
    margin: 2,
  },
  tabMovil: { width: '100%', minHeight: 48 },
  tabActivo: { backgroundColor: '#18253C' },
  tabIcono: { fontSize: 16, marginRight: 6 },
  tabTitulo: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  tabSubtitulo: { color: '#63718A', fontSize: 8, marginTop: 1 },
  tituloSeccion: { marginTop: 12, marginBottom: 10 },
  tituloSeccionTexto: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  descripcionSeccion: { color: '#617089', fontSize: 10, marginTop: 3 },
  alertaOriginal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#251D12',
    borderWidth: 1,
    borderColor: '#4D3B20',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  alertaIcono: { fontSize: 22, marginRight: 10 },
  alertaTexto: { flex: 1 },
  alertaTitulo: { color: '#FFD36A', fontSize: 12, fontWeight: '800' },
  alertaDescripcion: { color: '#9B8964', fontSize: 9, marginTop: 3 },
  metricas: { flexDirection: 'row', gap: 10, marginTop: 0 },
  metricasMovil: { flexDirection: 'column' },
  metrica: {
    flex: 1,
    minHeight: 120,
    backgroundColor: '#0C111D',
    borderWidth: 1,
    borderColor: '#202938',
    borderRadius: 14,
    padding: 14,
    position: 'relative',
  },
  metricaIcono: { fontSize: 20, marginBottom: 8 },
  metricaTitulo: { color: '#AAB4C5', fontSize: 10 },
  metricaNumero: { color: '#FFFFFF', fontSize: 25, fontWeight: '900', marginTop: 3 },
  metricaDescripcion: { color: '#617089', fontSize: 9, marginTop: 2 },
  badge: {
    position: 'absolute',
    top: 16,
    right: 12,
    backgroundColor: '#008F7A',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeTexto: { color: '#FFFFFF', fontSize: 7, fontWeight: '900' },
  recursos: {
    backgroundColor: '#0C111D',
    borderWidth: 1,
    borderColor: '#202938',
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
  },
  recursosHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recursosTitulo: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  recursosPorcentaje: { color: '#00E5FF', fontSize: 12, fontWeight: '900' },
  barra: { height: 7, backgroundColor: '#18202D', borderRadius: 10, overflow: 'hidden', marginTop: 9 },
  barraProgreso: { height: '100%', backgroundColor: '#00D9A6', borderRadius: 10 },
  recursosDescripcion: { color: '#62718A', fontSize: 9, marginTop: 9 },
  diseno: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 10,
  },
  disenoMovil: { alignItems: 'flex-start' },
  disenoTexto: { flex: 1, paddingRight: 10 },
  disenoTitulo: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
  disenoDescripcion: { color: '#617089', fontSize: 9, marginTop: 4 },
  resolucion: {
    backgroundColor: '#18253C',
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 7,
    alignItems: 'center',
  },
  resolucionNumero: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  resolucionTexto: { color: '#7B8BA5', fontSize: 8, marginTop: 2 },
  producto: {
    flexDirection: 'row',
    backgroundColor: '#0C111D',
    borderWidth: 1,
    borderColor: '#202938',
    borderRadius: 12,
    marginBottom: 10,
    padding: 10,
  },
  productoImagen: { width: 90, height: 90, borderRadius: 10, backgroundColor: '#18202D' },
  productoInfo: { flex: 1, paddingLeft: 12, justifyContent: 'center' },
  productoNombre: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  productoDescripcion: { color: '#6F7D94', fontSize: 9, marginTop: 4 },
  productoCategoria: { color: '#00D9FF', fontSize: 9, marginTop: 5 },
  productoPrecio: { color: '#00D9A6', fontSize: 13, fontWeight: '900', marginTop: 5 },
  fila: { gap: 10 },
  tarjetaAdaptativa: {
    backgroundColor: '#0C111D',
    borderWidth: 1,
    borderColor: '#202938',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
  },
  tarjetaUnaColumna: { flexDirection: 'row', width: '100%' },
  tarjetaDosColumnas: { flex: 1, minWidth: 0 },
  tarjetaTresColumnas: { flex: 1, minWidth: 0 },
  imagenAdaptativa: { width: '100%', height: 150, backgroundColor: '#18202D' },
  imagenUnaColumna: { width: 105, height: 105 },
  adaptativaInfo: { padding: 10, flex: 1 },
  adaptativaNombre: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  adaptativaCategoria: { color: '#00D9FF', fontSize: 9, marginTop: 4 },
  adaptativaPrecio: { color: '#00D9A6', fontSize: 12, fontWeight: '900', marginTop: 6 },

  /* --- Sensores --- */
  bannerSensor: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  bannerSimulado: { backgroundColor: '#1F1E29', borderColor: '#484469' },
  bannerReal: { backgroundColor: '#0D2727', borderColor: '#008F7A' },
  bannerIcono: { fontSize: 22, marginRight: 10 },
  bannerTextos: { flex: 1 },
  bannerTitulo: { color: '#00E5FF', fontSize: 12, fontWeight: '800' },
  bannerSubtitulo: { color: '#8898AA', fontSize: 9, marginTop: 3 },
  tarjetaSensor: {
    backgroundColor: '#0C111D',
    borderWidth: 1,
    borderColor: '#202938',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  sensorSubcabecera: { color: '#7D8799', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  sensorEstadoGrande: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', marginTop: 4, marginBottom: 14 },
  pistaNivel: {
    height: 48,
    backgroundColor: '#121A28',
    borderRadius: 24,
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#202938',
  },
  pistaContenedor: { width: '100%', height: '100%', justifyContent: 'center' },
  burbujaNivel: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#00E5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  burbujaTexto: { color: '#070B14', fontWeight: '900', fontSize: 12 },
  lecturasEjes: { flexDirection: 'row', gap: 8 },
  ejeCaja: {
    flex: 1,
    backgroundColor: '#18253C',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  ejeEtiqueta: { color: '#7D8799', fontSize: 10, fontWeight: '700' },
  ejeValor: { color: '#00D9A6', fontSize: 16, fontWeight: '900', marginTop: 3 },
  bloqueMejora: {
    backgroundColor: '#0C111D',
    borderWidth: 1,
    borderColor: '#202938',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mejoraTitulo: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  botonAccion: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  botonPausar: { backgroundColor: '#B83232' },
  botonReanudar: { backgroundColor: '#008F7A' },
  botonAccionTexto: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  panelSimulacion: {
    backgroundColor: '#0C111D',
    borderWidth: 1,
    borderColor: '#202938',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  simulacionTitulo: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  simulacionDescripcion: { color: '#687790', fontSize: 10, marginTop: 2, marginBottom: 12 },
  botonesFila: { flexDirection: 'row', gap: 8 },
  btnSimular: {
    flex: 1,
    backgroundColor: '#18253C',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#202938',
  },
  btnSimularTexto: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  btnAlternarModo: {
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: '#202938',
    borderRadius: 8,
    alignItems: 'center',
  },
  btnAlternarTexto: { color: '#00E5FF', fontSize: 11, fontWeight: '700' },
});