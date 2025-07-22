import React, { useRef } from 'react';
import { Page, Text, View, Document, StyleSheet, Image, PDFDownloadLink } from '@react-pdf/renderer';

import FirmaGerente from '../assets/FirmaContrato.png';
import Typography from '@mui/material/Typography';
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    lineHeight: 1.5,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 16,  // Aumentar el tamaño de la fuente para el título
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  contractId: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 10,
  },
  text: {
    textAlign: 'justify',
    marginBottom: 5,
  },
  textCity: {
    textAlign: 'justify',
    marginBottom: 5,
    fontSize: 8,  // Aumentar el tamaño de la fuente para los encabezados

  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',  // Estilo para texto itálico
  },
  header: {
    fontSize: 14,  // Aumentar el tamaño de la fuente para los encabezados
    marginTop: 10,
    marginBottom: 5,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  vehicleInfoContainer: {
    marginBottom: 20,
  },
  vehicleInfoItem: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  vehicleInfoLabel: {
    fontWeight: 'bold',
    width: '30%',
    fontSize: 11,
  },
  vehicleInfoValue: {
    width: '70%',
    fontSize: 11,
  },
  signatureContainer: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  signatureBlock: {
    textAlign: 'center',
    width: '45%',
  },
  signatureImage: {
    width: 150,
    height: 60,
    marginBottom: -20,
    alignSelf: 'center',
  },
  signatureImageTREASE: {
    width: 220,
    height: 90,
    marginBottom: -60,
    alignSelf: 'center',
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#000',
    marginTop: 25,
    paddingTop: 5,
  },
  signatureText: {
    marginTop: 10,
  },
});


const ContractDisplay = ({ auth, car }) => {
  const contentRef = useRef();
  console.log(auth.cartype,"ahabshabshabhsba")
  const today = new Date();
  const startDate = today.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

  const day = today.getDate();
  const month = today.toLocaleString('default', { month: 'long' });
  const year = today.getFullYear();
  const endDate = new Date(today.getTime() + (auth.vigencia * 24 * 60 * 60 * 1000));
  const formattedEndDate = endDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  const MyDocument = () => (
    <Document>
      {auth.cartype === 'TREAS-X' ? (
        <Page style={styles.page}>
          <Text style={styles.title}>
            Contrato Alquiler de Hosting y Procesamiento de Datos
          </Text>
          <Text style={styles.contractId}>
            Contrato No: {auth.uid}
          </Text>

          <View style={styles.section}>
            <Text style={styles.text}>
              Entre los suscritos, de una parte, <Text style={styles.bold}>TREAS CORP S.A.S</Text>, sociedad identificada con NIT. 901.565.494-9, domiciliada en la ciudad de Bogotá D.C. y quien actúa, en el <Text style={styles.bold}>CONTRATO ALQUILER DE HOSTING Y PROCESAMIENTO DE DATOS</Text>, mediante su representante legal el señor JAVIER JARAMILLO SANMIGUEL, Identificado con cedula de ciudadanía No. 80.872.720 de Bogotá; y de la otra el señor <Text style={styles.bold}>{auth.firstName} {auth.lastName} {auth.lastName}</Text>, mayor de edad, domiciliado y residente en Bogotá, identificado con la cédula de ciudadanía No. {auth.docNumber}, hemos acordado la suscripción del presente <Text style={styles.bold}>CONTRATO ALQUILER DE HOSTING Y PROCESAMIENTO DE DATOS</Text>, que se regirá por las siguientes cláusulas:
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.header}>PRIMERA. Objeto:</Text>
            <Text style={styles.text}>
              CONTRATO ALQUILER DE HOSTING Y PROCESAMIENTO DE DATOS entre <Text style={styles.bold}>TREAS CORP S.A.S</Text> y <Text style={styles.bold}>{auth.firstName} {auth.lastName} {auth.lastName}</Text> para que la plataforma tecnológica propiedad de la primera, tenga en su base de datos el vehículo automotor del segundo, el cual podrá ser tomado en arrendamiento con o sin conductor por los posibles arrendatarios registrados en el sistema dispuesto por la Sociedad, vehículo automotor que se relaciona a continuación:
            </Text>
          </View>

          <View style={styles.vehicleInfoContainer}>
            {[
              { label: 'PLACA:', value: auth.vehicleNumber },
              { label: 'TIPO DE SERVICIO:', value: auth.carType },
              { label: 'MARCA:', value: auth.vehicleMake },
              { label: 'LÍNEA:', value: auth.vehicleLine },
              { label: 'MODELO:', value: auth.vehicleModel },
              { label: 'COLOR:', value: auth.vehicleColor },
              { label: 'TIPO DE CARROCERÍA:', value: auth.vehicleMetalup },
              { label: 'NUMERO DE SERIE:', value: auth.vehicleNoSerie },
              { label: 'NUMERO DE MOTOR:', value: auth.vehicleNoMotor },
              { label: 'NUMERO DE CHASIS:', value: auth.vehicleNoChasis },
              { label: 'NUMERO DE VIN:', value: auth.vehicleNoVin },
              { label: 'CILINDRAJE:', value: auth.vehicleCylinders },
              { label: 'TIPO DE COMBUSTIBLE:', value: auth.vehicleFuel },
              { label: 'NUMERO DE PUERTAS:', value: auth.vehicleDoors },
              { label: 'CAPACIDAD:', value: auth.vehiclePassengers },
            ].map((item, index) => (
              <View key={index} style={styles.vehicleInfoItem}>
                <Text style={styles.vehicleInfoLabel}>{item.label}</Text>
                <Text style={styles.vehicleInfoValue}>{item.value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.header}>SEGUNDA. Contribuciones:</Text>
            <Text style={styles.text}>
              Para el desarrollo del objeto del presente contrato <Text style={styles.bold}>TREAS CORP S.A.S</Text> contribuirá con la plataforma tecnológica de su propiedad.
            </Text>
            <Text style={styles.header}>Parágrafo:</Text>
            <Text style={styles.text}>
              Con la suscripción de este <Text style={styles.bold}>CONTRATO ALQUILER DE HOSTING Y PROCESAMIENTO DE DATOS</Text>, <Text style={styles.bold}>{auth.firstName} {auth.lastName} {auth.lastName}</Text> autoriza expresamente a <Text style={styles.bold}>TREAS CORP S.A.S</Text> para que suscriba en su nombre y representación de <Text style={styles.bold}>{auth.firstName} {auth.lastName} {auth.lastName}</Text>, el contrato de arrendamiento del vehículo automotor con o sin conductor con el posible arrendatario registrado en la plataforma tecnológica que así lo solicite conforme a los términos y condiciones que defina <Text style={styles.bold}>TREAS CORP S.A.S</Text>.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.header}>TERCERA. Retorno de contribuciones:</Text>
            <Text style={styles.text}>
              A la terminación del plazo de vigencia del contrato la contribución de <Text style={styles.bold}>TREAS CORP S.A.S</Text> retornará a su respectivo propietario.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.header}>CUARTA. Utilidades y pérdidas:</Text>
            <Text style={styles.text}>
              <Text style={styles.bold}>TREAS CORP S.A.S</Text> no participará de posibles pérdidas o ganancias que arroje la ejecución del contrato de arrendamiento de vehículo automotor con o sin conductor.
            </Text>
            <Text style={styles.text}>
              En ese sentido, <Text style={styles.bold}>TREAS CORP S.A.S</Text>, dispondrá de un medio tecnológico para recibir el valor total del valor del Hosting que debe prepagar <Text style={styles.bold}>{auth.firstName} {auth.lastName} {auth.lastName}</Text> y que adicionalmente deberá precargar su paquete obligatorio de seguros - de Responsabilidad Civil Contractual (RC) y Responsabilidad Civil Extracontractual (RCE) - para poder prestar sus servicio como proveedores. Por esta actividad <Text style={styles.bold}>TREAS CORP S.A.S</Text> cobrará, un % adicional del valor del canon del seguro pagado por <Text style={styles.bold}>{auth.firstName} {auth.lastName} {auth.lastName}</Text>, al momento de la terminación de cada contrato de arrendamiento de vehículo automotor con o sin conductor por la prestación de servicios en el tratamiento de datos, por arrendamiento del hosting y los demás servicios tecnológicos relacionados con estos.
            </Text>
            <Text style={styles.header}>Parágrafo primero:</Text>
            <Text style={styles.text}>
              Los valores recaudados por <Text style={styles.bold}>TREAS CORP S.A.S</Text> a favor de <Text style={styles.bold}>{auth.firstName} {auth.lastName} {auth.lastName}</Text> serán pagados a este según lo convenido, junto con el valor de la prima correspondiente al valor de la póliza de seguros, descontado del porcentaje respectivo según lo explicado en el párrafo anterior, cada día después de las 5:00 pm en días hábiles laborales siguiente a su recaudo, en las cuentas registradas por <Text style={styles.bold}>{auth.firstName} {auth.lastName} {auth.lastName}</Text> por y los costos de dichas transferencias si los hay, deben ser asumidos por el arrendatario.
            </Text>
            <Text style={styles.header}>Parágrafo segundo:</Text>
            <Text style={styles.text}>
              De acuerdo con la naturaleza de este contrato, contenida en el inciso segundo de presente artículo, <Text style={styles.bold}>TREAS CORP S.A.S</Text> debe incluir en su declaración de renta e IVA, solo los ingresos que obtenga por la comisión a que tienen derecho por la labor tecnológica que realiza. Por lo tanto, las partes reconocen que los otros ingresos, costos y gastos, aunque se encuentren facturados a nombre de <Text style={styles.bold}>TREAS CORP S.A.S</Text>, no le pertenecen.
            </Text>
            <Text style={styles.text}>
              En consecuencia, <Text style={styles.bold}>{auth.firstName} {auth.lastName} {auth.lastName}</Text> debe incluir en su declaración todos los impuestos sobre todos los ingresos, costos y deducciones que se deriven del contrato, soportándolos con la certificación y facturas emitidas por el <Text style={styles.bold}>TREAS CORP S.A.S</Text>.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.header}>QUINTA. Responsabilidad frente a terceros:</Text>
            <Text style={styles.text}>
              En caso de pérdidas u obligaciones de cualquier naturaleza frente a terceros, <Text style={styles.bold}>{auth.firstName} {auth.lastName} {auth.lastName}</Text> responderá por las mismas.
            </Text>
            <Text style={styles.header}>Parágrafo:</Text>
            <Text style={styles.text}>
              <Text style={styles.bold}>{auth.firstName} {auth.lastName} {auth.lastName}</Text>, deberá adquirir de manera anticipada las pólizas de responsabilidad civil contractual y extracontractual para cubrir la responsabilidad que se pueda causar frente al contratante y/o a terceros, para facilitar lo anterior, <Text style={styles.bold}>TREAS CORP S.A.S</Text> actuará como tomador de las pólizas de seguros de las mencionadas pólizas de responsabilidad civil contractual y extracontractual, fungiendo <Text style={styles.bold}>{auth.firstName} {auth.lastName} {auth.lastName}</Text> como asegurado de las pólizas correspondientes, debiendo efectuar el pago de las primas correspondientes.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.header}>SEXTA. Control de las operaciones:</Text>
            <Text style={styles.text}>
              Corresponde a <Text style={styles.bold}>{auth.firstName} {auth.lastName} {auth.lastName}</Text> la gestión, administración y realización del negocio materia del presente contrato. En tal sentido, <Text style={styles.bold}>{auth.firstName} {auth.lastName} {auth.lastName}</Text> deberá proceder con diligencia, prudencia, buena fe y lealtad. Para esto, <Text style={styles.bold}>{auth.firstName} {auth.lastName} {auth.lastName}</Text> deberá mantener el vehículo en buen estado y con toda la documentación legalmente exigida para la operación del vehículo (SOAT, Revisión Técnico-Mecánica, cuando aplique y las pólizas aludidas en la cláusula quinta).
            </Text>
            <Text style={styles.text}>
              Asimismo, las partes declaran expresamente que corresponde a <Text style={styles.bold}>{auth.firstName} {auth.lastName} {auth.lastName}</Text> cualquier vinculación económica que en el desarrollo del negocio se acuerde con terceros, para lo cual <Text style={styles.bold}>{auth.firstName} {auth.lastName} {auth.lastName}</Text> actuará en nombre propio al celebrar contratos, al asumir obligaciones o al adquirir créditos, sin perjuicio de la autorización de que trata el parágrafo de la cláusula segunda del presente Acuerdo.
            </Text>
            <Text style={styles.text}>
              En consecuencia, queda convenido que no existirá relación jurídica alguna entre los terceros y <Text style={styles.bold}>TREAS CORP S.A.S</Text> y asimismo, los terceros no adquirirán derechos ni asumirán obligaciones frente a <Text style={styles.bold}>TREAS CORP S.A.S</Text> ni éste ante aquellos.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.header}>SÉPTIMA. Deber de información:</Text>
            <Text style={styles.text}>
              <Text style={styles.bold}>{auth.firstName} {auth.lastName} {auth.lastName}</Text> está obligado a informar periódicamente a <Text style={styles.bold}>TREAS CORP S.A.S</Text> acerca de la marcha del negocio materia del presente contrato y a rendir cuentas sobre el mismo.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.header}>OCTAVA. Inspección de las operaciones:</Text>
            <Text style={styles.text}>
              <Text style={styles.bold}>TREAS CORP S.A.S</Text> tendrá la facultad de fiscalización y control de los actos de <Text style={styles.bold}>{auth.firstName} {auth.lastName} {auth.lastName}</Text>.
            </Text>
            <Text style={styles.text}>
              En consecuencia, <Text style={styles.bold}>TREAS CORP S.A.S</Text> tendrá derecho a exigir se le muestren los documentos que permitan conocer el estado real del desenvolvimiento económico del negocio.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.header}>NOVENA. Participación de terceros:</Text>
            <Text style={styles.text}>
              <Text style={styles.bold}>{auth.firstName} {auth.lastName} {auth.lastName}</Text> no podrá atribuir a otras empresas o personas alguna participación en el presente <Text style={styles.bold}>CONTRATO ALQUILER DE HOSTING Y PROCESAMIENTO DE DATOS</Text>.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.header}>DÉCIMA. Exclusividad:</Text>
            <Text style={styles.text}>
              <Text style={styles.bold}>{auth.firstName} {auth.lastName} {auth.lastName}</Text> se obliga, dentro del periodo de duración del presente contrato y hasta por 5 años una vez terminado el mismo, a no realizar en forma individual o a través de terceros actividad idéntica o similar de la que es materia del presente Acuerdo, de lo contrario se aplicará una sanción financiera de 120 SMMLV.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.header}>DÉCIMA PRIMERA. Duración:</Text>
            <Text style={styles.text}>
              El presente Acuerdo tiene una duración de un (01) año contado a partir de su celebración y se renovará automáticamente por periodos iguales salvo que se comunique a la otra parte la intención de no renovar el mismo por medio de correo certificado tres (3) meses antes del vencimiento del presente Acuerdo.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.header}>DÉCIMA SEGUNDA. Uso de marcas comerciales:</Text>
            <Text style={styles.text}>
              Las partes expresamente acuerdan que en la promoción del negocio se podrán utilizar las marcas comerciales propiedad de <Text style={styles.bold}>TREAS CORP S.A.S</Text>, siempre y cuando se observe lo previsto de la cláusula sexta del presente contrato.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.header}>DÉCIMA TERCERA. Acuerdo de confidencialidad:</Text>
            <Text style={styles.text}>
              Las partes acuerdan que mantendrán la confidencialidad de los datos e información intercambiados entre ellas, incluyendo información objeto de derechos de autor, patentes técnicas, modelos, invenciones, know-how, procesos, algoritmos, programas, ejecutables, investigaciones, detalles de diseño, información financiera, lista de clientes, proveedores, inversionistas, empleados, relaciones de negocios y contractuales; pronósticos de negocios, planes de mercadeo, metodologías de viabilización técnica y/o financiera propia, modelos de negocio, así como cualquier información revelada en el desarrollo del presente contrato de suministro sobre terceras personas. Las partes acuerdan que cualquier información intercambiada, facilitada o creada entre ellas en la ejecución del presente contrato, será mantenida en estricta confidencialidad, aún después de vencido o terminado el plazo definido en el mismo. La parte receptora correspondiente sólo podrá revelar información confidencial a quienes la necesiten y estén autorizados previamente por la parte de cuya información confidencial se trata.
            </Text>
            <Text style={styles.header}>Parágrafo Primero. Sanciones por Violar el Acuerdo de Confidencialidad:</Text>
            <Text style={styles.text}>
              Si alguna de las partes viola alguna de las disposiciones antes mencionadas en relación con lo que se considera objeto de la Confidencialidad, ocasionará el pago de una multa de $ 100.000.000 COP, sin perjuicio de las demás acciones laborales, comerciales y penales a que haya lugar para la reclamación de indemnización de perjuicios ocasionados con la violación a la Confidencialidad aquí suscrita.
            </Text>
            <Text style={styles.header}>Parágrafo Segundo:</Text>
            <Text style={styles.text}>
              Esta misma sanción se aplicará en caso de que el <Text style={styles.bold}>{auth.firstName} {auth.lastName} {auth.lastName}</Text> contacte al arrendatario de su vehículo a través de medios diferentes a la plataforma TREASAPP una vez terminado el contrato de Arrendamiento.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.header}>DÉCIMA CUARTA. Solución de controversias:</Text>
            <Text style={styles.text}>
              Las controversias o diferencias que surjan entre las partes con ocasión de la firma, ejecución, interpretación o terminación del Contrato, así como de cualquier otro asunto relacionado con el presente Contrato, serán sometidas a la revisión de las partes para buscar un arreglo directo, en un término no mayor a cinco (5) días hábiles a partir de la fecha en que cualquiera de las partes comunique por escrito a la otra la existencia de una diferencia.
            </Text>
            <Text style={styles.text}>
              Las controversias que no puedan ser resueltas de forma directa entre las partes, se resolverán mediante un procedimiento conciliatorio que se surtirá ante la CÁMARA DE COMERCIO DE BOGOTÁ, previa solicitud de conciliación elevada individual o conjuntamente por las Partes. Si en el término de ocho (8) días hábiles a partir del inicio del trámite de la conciliación, el cual se entenderá a partir de la fecha de la primera citación a las Partes que haga CÁMARA DE COMERCIO, las Partes no llegan a un acuerdo para resolver sus diferencias deben acudir a la jurisdicción competente.
            </Text>
          </View>

          <View style={styles.section}>
          <Text style={styles.text}>
      En señal de conformidad las partes suscriben el presente documento de manera digital a los ({day}) días del mes de {month} del año {year}.
    </Text>
          </View>
          <View style={styles.signatureContainer}>
            <View style={styles.signatureBlock}>
              <Image src={FirmaGerente} style={styles.signatureImage} />
              <Text style={styles.signatureLine}></Text>
              <Text style={styles.signatureText}>TREAS CORP S.A.S</Text>
              <Text style={styles.signatureText}>Nombre: Erixon Chaparro Martínez</Text>
              <Text style={styles.signatureText}>Cargo: Gerente General</Text>
            </View>
            <View style={styles.signatureBlock}>
              <Text style={styles.signatureLine}></Text>
              <Text style={styles.signatureText}>{auth.firstName} {auth.lastName} {auth.lastName}</Text>
              <Text style={styles.signatureText}>No. de Cédula: {auth.docNumber}</Text>
            </View>
          </View>
        </Page>
      ) : (
        <Page style={styles.page}>
          <Text style={styles.title}>
            CONTRATO DE PRESTACIÓN DE SERVICIOS DE TRANSPORTE ESPECIAL DECRETO 1079 DE
            2015 MODIFICADO POR EL 0431 DE 2017 (DECRETOS MINISTERIO DE TRANSPORTE)

            CONTRATO
          </Text>
          <Text style={styles.contractId}>
            {auth.id}
          </Text>

          <View style={styles.section}>
            <Text style={styles.text}>
              Entre los suscritos a saber <Text style={styles.bold}>JAVIER JARAMILLO SANMIGUEL</Text> mayor de edad identificado con Cédula de Ciudadanía No. 80.872.720 de Bogotá y domiciliado en Bogotá actuando en nombre y representación de la empresa <Text style={styles.bold}>TREAS CORP SAS</Text> NIT. 901.656.494-9 con domicilio en la Av. Calle 100 # 8a – 55 World Trade Center Torre C en Bogotá y que para el presente contrato se denominará EL CONTRATANTE y por otra parte <Text style={styles.bold}>{auth.firstName} {auth.lastName} {auth.lastName}</Text> mayor de edad identificado con Cédula de Ciudadanía No. {auth.docNumber} quien actúa como Representante Legal de la Empresa {auth.CompanyName}. Identificado(a) con Nit. {auth.NIT} domiciliado en {auth.addresCompany} en {auth.cityCompany} quien para efectos del presente contrato se denominará EL CONTRATISTA hemos acordado celebrar el Presente contrato de Prestación de Servicios para desarrollar actividades relacionadas con el Servicio Público de Transporte Especial de Pasajeros y Mensajería regulado por las normas y disposiciones vigentes en la República de Colombia para este tipo de contrataciones y en especial las contenidas en el Código Civil y enmarcado dentro de las siguientes cláusulas:
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.header}>PRIMERA: OBJETO</Text>
            <Text style={styles.text}>
              El contratista se compromete a prestar al Grupo Especifico de Usuarios del contratante el servicio de transporte la vigilancia y control de la normatividad del servicio de transporte especial de pasajeros así lo anterior como beneficio a nuestro grupo de Miembros de la empresa.
              &quot; TRANSPORTE DE PERSONAL, FUNCIONARIOS, CONTRATISTAS, EMPRESARIOS, MIEMBROS Y CLIENTES ASIGNADOS
              PREVIAMENTE POR LA EMPRESA TREAS CORP SAS Y CUYOS OCUPANTES AL MENOS UNO DEBE ESTAR DEBIDAMENTE
              CARNETIZADO CON NUESTRA EMPRESA TREASCORP SAS CON NOMBRE Y NÚMERO DE CÉDULA.
              POR EL PERÍMETRO URBANO EN BOGOTÁ D.C, SUS 20 LOCALIDADES Y AEROPUERTO EL DORADO&quot; SALIENDO DE BOGOTÁ
              A LOS SIGUIENTES MUNICIPIOS DEL DEPARTAMENTO DE CUNDINAMARCA Y AEROPUERTO ELDORADO, TERMINALES DE
              TRANSPORTE TERRESTRE: CHÍA, CAJICA, COTA, SIBERIA, FUNZA, MOSQUERA, MADRID, FACATATIVÁ, ALBÁN, SASAIMA,
              MELGAR, FLANDES, ESPINAL, GUALANDAY, IBAGUÉ, VILLETA, GUADUAS, PUERTO BOYACÁ, SOACHA, GRANADA,
              SILVANIA, FUSAGASUGÁ, CHINAUTA, MELGAR, BOQUERÓN, LA MESA, MESITAS, RICAURTE, GIRARDOT, ANAPOIMA,
              APULO, TOCAIMA, TABIO, TENJO, BRICEÑO, TOCANCIPÁ, GACHANCIPÁ, SESQUILÉ, CHOCONTÁ, VILLA PINZÓN,
              GUATEQUE, PUENTE PIEDRA, EL ROSAL, EL VINO, SAN FRANCISCO, LA VEGA, NOCAIMA, VILLETA, GUADUAS, ZIPAQUIRÁ,
              SOPÓ, GUATAVITA, LA CALERA, QUEBRADANERGA, UTICA, YACOPI, LA AGUADA, EL PEÑÓN, CARAPEGUA, SUSATAUSA,
              UBATÉ, FUQUENE, SIMIJACA, Y SUSA.
            </Text>

            &quot; TRANSPORTE DE PERSONAL, FUNCIONARIOS, CONTRATISTAS, EMPRESARIOS, MIEMBROS Y CLIENTES ASIGNADOS
            PREVIAMENTE POR LA EMPRESA TREAS CORP SAS Y CUYOS OCUPANTES AL MENOS UNO DEBE ESTAR DEBIDAMENTE
            CARNETIZADO CON NUESTRA EMPRESA TREASCORP SAS CON NOMBRE Y NÚMERO DE CÉDULA. &quot;
          </View>
          <View style={styles.vehicleInfoContainer}>
            {[
           
          
              { label: 'TIPO:', value: auth.vehicleForm },
              { label: 'PLACA:', value: auth.vehicleNumber },
              { label: 'MARCA:', value: auth.vehicleMake },

              { label: 'NOMBRE DEL CONDUCTOR:', value: `${auth.firstName} {auth.lastName} ${auth.lastName}` },
              { label: 'CEDULA DEL CONDUCTOR:', value: auth.verifyId},
           
            ].map((item, index) => (
              <View key={index} style={styles.vehicleInfoItem}>
                <Text style={styles.vehicleInfoLabel}>{item.label}</Text>
                <Text style={styles.vehicleInfoValue}>{item.value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.header}>SEGUNDA: OBLIGACIONES DEL CONTRATISTA</Text>
            <Text style={styles.text}>
              Son obligaciones las siguientes:
            </Text>
            <Text style={styles.text}>
              1) Contar con personal idóneo y calificado que cumpla con los requisitos de movilidad.
            </Text>
            <Text style={styles.text}>
              2) Realizar las actividades teniendo en cuenta las disposiciones legales dictadas por el Ministerio de Transporte y Medio Ambiente vigentes.
            </Text>
            <Text style={styles.text}>
              3) Deberá cumplir con todos los requisitos para la libre circulación y prestación de servicio de transportes exigidos por el Ministerio de Transporte y demás entidades que regulan esta clase de transporte. Este requisito es aplicable tanto para los vehículos como para los conductores.
            </Text>
            <Text style={styles.text}>
              4) El vehículo debe tener vigentes durante la ejecución del contrato los siguientes documentos: Tarjeta de operación, Soat, Tarjeta de Propiedad, Revisión Técnico-mecánica y los demás documentos exigidos por las autoridades de tránsito para la prestación de este servicio.
            </Text>
            <Text style={styles.text}>
              5) Se obliga al cumplimiento de todas las leyes laborales vigentes y al pago por su cuenta de todos los salarios prestaciones sociales de Ley y deberá afiliar a los conductores al sistema de seguridad social en salud pensión ARL y cajas de compensación.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.header}>TERCERA: CONDICIONES DEL VEHÍCULO</Text>
            <Text style={styles.text}>
              Para el óptimo servicio EL CONTRATISTA se obliga a emplear los vehículos que cumplan con las siguientes características:
            </Text>
            <Text style={styles.text}>
              1) Vehículo tipo {auth.vehicleType} con aire acondicionado con equipo de sonido con capacidad máxima de {auth.vehicleCapacity} personas INCLUIDO EL CONDUCTOR sentadas cómodamente, teléfono celular dotado con el botiquín de primeros auxilios y equipo de carretera.
            </Text>
            <Text style={styles.text}>
              2) El vehículo deberá mantenerse en perfectas condiciones mecánicas de mantenimiento, pintura, tapizado, aseo, higiene y presentación general.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.header}>CUARTA: VIGENCIA DE CONTRATO</Text>
            <Text style={styles.text}>
            El contrato empresarial de prestación de servicios tendrá vigencia desde {startDate} hasta el {formattedEndDate}.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.header}>QUINTA: TERMINACIÓN DEL CONTRATO</Text>
            <Text style={styles.text}>
              El presente contrato termina por voluntad de las partes de común acuerdo. En forma unilateral cuando alguna de las partes incumpla con alguna de las condiciones y obligaciones establecidas en este contrato.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.text}>
            Para constancia se firma por las partes en dos ejemplares del mismo tenor, en la ciudad de Bogotá a los
un ({day}) días del mes de  {month} del año {year}.
            </Text>
          </View>

          <View style={styles.signatureContainer}>
            <View style={styles.signatureBlock}>
              <Text style={styles.signatureLine}></Text>
              <Text style={styles.signatureText}>REPRESENTANTE LEGAL</Text>
              <Text style={styles.signatureText}>{auth.Full_Name_Legal_Representative}
              </Text>
              <Text style={styles.signatureText}>C.C. {auth.verifyIdRepresentativeLegal}</Text>
              
              <Text style={styles.signatureText}>{auth.CompanyName}</Text>
            </View>
            <View style={styles.signatureBlock}>
            <Image src={FirmaGerente} style={styles.signatureImageTREASE} />
              <Text style={styles.signatureLine}>Firma por poder.</Text>
              <Text style={styles.signatureText}>ERIXON CHAPARRO MARTÍNEZ</Text>
              <Text style={styles.signatureText}>C.C. 80.024.555 de Bogotá</Text>
              <Text style={styles.signatureText}>GERENTE GENERAL</Text>
              <Text style={styles.signatureText}>TREAS CORP SAS</Text>
            </View>
          </View>
        </Page>
      )}

    </Document>

  ); 


  return (
    <div className="overflow-y-auto max-h-[calc(100vh-200px)] bg-white shadow-md p-6 rounded-lg" ref={contentRef}>
    {auth.cartype === 'TREAS-X' ? (
      <>
      <h2 className="text-3xl font-bold text-center mb-6">
        CONTRATO ALQUILER DE HOSTING Y PROCESAMIENTO DE DATOS {auth.cartype}
      </h2>
      <Typography variant="body1" textAlign="justify">
        <p><strong>Contrato No:</strong> {auth.uid}</p>
        <p className="mt-4">
          Entre los suscritos, de una parte, <strong>TREAS CORP S.A.S</strong>, sociedad identificada con NIT. 901.565.494-9,
          domiciliada en la ciudad de Bogotá D.C. y quien actúa, en el <strong>CONTRATO ALQUILER DE HOSTING Y PROCESAMIENTO DE DATOS</strong>,
          mediante su representante legal el señor JAVIER JARAMILLO SANMIGUEL, Identificado con cédula de ciudadanía No.
          80.872.720 de Bogotá; y de la otra el señor <strong>{auth.firstName} {auth.lastName} {auth.lastName} </strong>, mayor de edad, domiciliado y residente en Bogotá,
          identificado con la cédula de ciudadanía No. {auth.verifyId}, hemos acordado la suscripción del presente
          <strong> CONTRATO ALQUILER DE HOSTING Y PROCESAMIENTO DE DATOS</strong>, que se regirá por las siguientes cláusulas:
        </p>
      </Typography>

      <div className="text-lg">
        <Typography variant="body1" textAlign="justify">
          <h3 className="font-bold mt-4">PRIMERA. Objeto:</h3>
          <p className="mb-4">
            CONTRATO ALQUILER DE HOSTING Y PROCESAMIENTO DE DATOS entre TREAS CORP S.A.S y <strong> {auth.firstName} {auth.lastName} {auth.lastName} </strong>
            para que la plataforma tecnológica propiedad de la primera, tenga en su base de datos el vehículo automotor del
            segundo, el cual podrá ser tomado en arrendamiento con o sin conductor por los posibles arrendatarios registrados en el
            sistema dispuesto por la Sociedad, vehículo automotor que se relaciona a continuación:
          </p>
        </Typography>

        <div className="mb-4">
          <Typography style={{ textAlign: 'initial' }}>PLACA: {auth.vehicleNumber}</Typography>
          <Typography style={{ textAlign: 'initial' }}>TIPO DE SERVICIO: {auth.carType}</Typography>
          <Typography style={{ textAlign: 'initial' }}>MARCA: {auth.vehicleMake}</Typography>
          <Typography style={{ textAlign: 'initial' }}>LÍNEA: {auth.vehicleLine}</Typography>
          <Typography style={{ textAlign: 'initial' }}>MODELO: {auth.vehicleModel}</Typography>
          <Typography style={{ textAlign: 'initial' }}>COLOR: {auth.vehicleColor}</Typography>
          <Typography style={{ textAlign: 'initial' }}>TIPO DE CARROCERÍA: {auth.vehicleMetalup}</Typography>
          <Typography style={{ textAlign: 'initial' }}>NUMERO DE SERIE: {auth.vehicleNoSerie}</Typography>
          <Typography style={{ textAlign: 'initial' }}>NUMERO DE MOTOR: {auth.vehicleNoMotor}</Typography>
          <Typography style={{ textAlign: 'initial' }}>NUMERO DE CHASIS: {auth.vehicleNoChasis}</Typography>
          <Typography style={{ textAlign: 'initial' }}>NUMERO DE VIN: {auth.vehicleNoVin}</Typography>
          <Typography style={{ textAlign: 'initial' }}>CILINDRAJE: {auth.vehicleCylinders}</Typography>
          <Typography style={{ textAlign: 'initial' }}>TIPO DE COMBUSTIBLE: {auth.vehicleFuel}</Typography>
          <Typography style={{ textAlign: 'initial' }}>NUMERO DE PUERTAS: {auth.vehicleDoors}</Typography>
          <Typography style={{ textAlign: 'initial' }}>CAPACIDAD: {auth.vehiclePassengers}</Typography>


        </div>
        <div className="page-break">
          <Typography variant="body1" textAlign="justify">
            <h3 className="font-bold mt-4">SEGUNDA. Contribuciones:</h3>
            <p className="mb-4">
              Para el desarrollo del objeto del presente contrato <strong>TREAS CORP S.A.S</strong> contribuirá con la
              plataforma tecnológica de su propiedad.
            </p>

            <h3 className="font-bold mt-4">Parágrafo:</h3>
            <p className="mb-4">
              Con la suscripción de este <strong>CONTRATO ALQUILER DE HOSTING Y PROCESAMIENTO DE DATOS</strong>,
              <strong> {auth.firstName} {auth.lastName}</strong> autoriza expresamente a <strong>TREAS CORP S.A.S</strong> para que suscriba en su nombre
              y representación de <strong>{auth.firstName} {auth.lastName}</strong>, el contrato de arrendamiento del vehículo automotor con o sin conductor con el posible arrendatario registrado en la plataforma tecnológica que así lo solicite conforme a los términos y condiciones que defina TREAS CORP S.A.S.
            </p>

            <h3 className="font-bold mt-4">TERCERA. Retorno de contribuciones:</h3>
            <p className="mb-4">
              A la terminación del plazo de vigencia del contrato la contribución de TREAS CORP SAS retornará a su respectivo propietario.
            </p>

            <h3 className="font-bold mt-4">CUARTA. Utilidades y pérdidas:</h3>
            <p className="mb-4">
              TREAS CORP S.A.S no participará de posibles pérdidas o ganancias que arroje la ejecución del contrato de arrendamiento de vehículo automotor con o sin conductor.
            </p>

            <p className="mb-4">
              En ese sentido, TREAS CORP S.A.S, dispondrá de un medio tecnológico para recibir el valor total del valor del Hosting que debe prepagar <strong>{auth.firstName} {auth.lastName}</strong> y que adicionalmente deberá precargar su paquete obligatorio de seguros - de Responsabilidad Civil Contractual (RC) y Responsabilidad Civil Extracontractual (RCE) - para poder prestar sus servicio como proveedores. Por esta actividad TREAS CORP S.A.S cobrará, un % adicional del valor del canon del seguro pagado por <strong>{auth.firstName} {auth.lastName}</strong>, al momento de la terminación de cada contrato de arrendamiento de vehículo automotor con o sin conductor por la prestación de servicios en el tratamiento de datos, por arrendamiento del hosting y los demás servicios tecnológicos relacionados con estos.
            </p>

            <h3 className="font-bold mt-4">Parágrafo primero:</h3>
            <p className="mb-4">
              Los valores recaudados por TREAS CORP S.A.S a favor de <strong>{auth.firstName} {auth.lastName}</strong> serán pagados a este según lo convenido, junto con el valor de la prima correspondiente al valor de la póliza de seguros, descontado del porcentaje respectivo según lo explicado en el párrafo anterior, cada día después de las 5:00 pm en días hábiles laborales siguiente a su recaudo, en las cuentas registradas por <strong>{auth.firstName} {auth.lastName}</strong> por y los costos de dichas transferencias si los hay, deben ser asumidos por el arrendatario.
            </p>

            <h3 className="font-bold mt-4">Parágrafo segundo:</h3>
            <p className="mb-4">
              De acuerdo con la naturaleza de este contrato, contenida en el inciso segundo de presente artículo, TREAS CORP S.A.S debe incluir en su declaración de renta e IVA, solo los ingresos que obtenga por la comisión a que tienen derecho por la labor tecnológica que realiza. Por lo tanto, las partes reconocen que los otros ingresos, costos y gastos, aunque se encuentren facturados a nombre de TREAS CORP S.A.S, no le pertenecen.
            </p>

            <p className="mb-4">
              En consecuencia, <strong>{auth.firstName} {auth.lastName}</strong> debe incluir en su declaración todos los impuestos sobre todos los ingresos, costos y deducciones que se deriven del contrato, soportándolos con la certificación y facturas emitidas por el TREAS CORP S.A.S.
            </p>

            <h3 className="font-bold mt-4">QUINTA. Responsabilidad frente a terceros:</h3>
            <p className="mb-4">
              En caso de pérdidas u obligaciones de cualquier naturaleza frente a terceros, <strong>{auth.firstName} {auth.lastName}</strong> responderá por las mismas.
            </p>

            <h3 className="font-bold mt-4">Parágrafo:</h3>
            <p className="mb-4">
              <strong>{auth.firstName} {auth.lastName}</strong>, deberá adquirir de manera anticipada las pólizas de responsabilidad civil contractual y extracontractual para cubrir la responsabilidad que se pueda causar frente al contratante y/o a terceros, para facilitar lo anterior, TREAS CORP S.A.S actuará como tomador de las pólizas de seguros de las mencionadas pólizas de responsabilidad civil contractual y extracontractual, fungiendo <strong>{auth.firstName} {auth.lastName}</strong> como asegurado de las pólizas correspondientes, debiendo efectuar el pago de las primas correspondientes.
            </p>

            <h3 className="font-bold mt-4">SEXTA. Control de las operaciones:</h3>
            <p className="mb-4">
              Corresponde a <strong>{auth.firstName} {auth.lastName}</strong> la gestión, administración y realización del negocio materia del presente contrato. En tal sentido, <strong>{auth.firstName} {auth.lastName}</strong> deberá proceder con diligencia, prudencia, buena fe y lealtad. Para esto, <strong>{auth.firstName} {auth.lastName}</strong> deberá mantener el vehículo en buen estado y con toda la documentación legalmente exigida para la operación del vehículo (SOAT, Revisión Técnico-Mecánica, cuando aplique y las pólizas aludidas en la cláusula quinta).
            </p>

            <p className="mb-4">
              Asimismo, las partes declaran expresamente que corresponde a <strong>{auth.firstName} {auth.lastName}</strong> cualquier vinculación económica que en el desarrollo del negocio se acuerde con terceros, para lo cual <strong>{auth.firstName} {auth.lastName}</strong> actuará en nombre propio al celebrar contratos, al asumir obligaciones o al adquirir créditos, sin perjuicio de la autorización de que trata el parágrafo de la cláusula segunda del presente Acuerdo.
            </p>

            <p className="mb-4">
              En consecuencia, queda convenido que no existirá relación jurídica alguna entre los terceros y TREAS CORP S.A.S y asimismo, los terceros no adquirirán derechos ni asumirán obligaciones frente a TREAS CORP S.A.S ni éste ante aquellos.
            </p>

            <h3 className="font-bold mt-4">SÉPTIMA. Deber de información:</h3>
            <p className="mb-4">
              <strong>{auth.firstName} {auth.lastName}</strong> está obligado a informar periódicamente a TREAS CORP S.A.S acerca de la marcha del negocio materia del presente contrato y a rendir cuentas sobre el mismo.
            </p>

            <h3 className="font-bold mt-4">OCTAVA. Inspección de las operaciones:</h3>
            <p className="mb-4">
              TREAS CORP S.A.S tendrá la facultad de fiscalización y control de los actos de <strong>{auth.firstName} {auth.lastName}</strong>.
            </p>

            <p className="mb-4">
              En consecuencia, TREAS CORP S.A.S tendrá derecho a exigir se le muestren los documentos que permitan conocer el estado real del desenvolvimiento económico del negocio.
            </p>

            <h3 className="font-bold mt-4">NOVENA. Participación de terceros:</h3>
            <p className="mb-4">
              <strong>{auth.firstName} {auth.lastName}</strong> no podrá atribuir a otras empresas o personas alguna participación en el presente CONTRATO ALQUILER DE HOSTING Y PROCESAMIENTO DE DATOS.
            </p>

            <h3 className="font-bold mt-4">DÉCIMA. Exclusividad:</h3>
            <p className="mb-4">
              <strong>{auth.firstName} {auth.lastName}</strong> se obliga, dentro del periodo de duración del presente contrato y hasta por 5 años una vez terminado el mismo, a no realizar en forma individual o a través de terceros actividad idéntica o similar de la que es materia del presente Acuerdo, de lo contrario se aplicará una sanción financiera de 120 SMMLV.
            </p>

            <h3 className="font-bold mt-4">DÉCIMA PRIMERA. Duración:</h3>
            <p className="mb-4">
              El presente Acuerdo tiene una duración de un (01) año contado a partir de su celebración y se renovará automáticamente por periodos iguales salvo que se comunique a la otra parte la intención de no renovar el mismo por medio de correo certificado tres (3) meses antes del vencimiento del presente Acuerdo.
            </p>

            <h3 className="font-bold mt-4">DÉCIMA SEGUNDA. Uso de marcas comerciales:</h3>
            <p className="mb-4">
              Las partes expresamente acuerdan que en la promoción del negocio se podrán utilizar las marcas comerciales propiedad de TREAS CORP S.A.S, siempre y cuando se observe lo previsto de la cláusula sexta del presente contrato.
            </p>

            <h3 className="font-bold mt-4">DÉCIMA TERCERA. Acuerdo de confidencialidad:</h3>
            <p className="mb-4">
              Las partes acuerdan que mantendrán la confidencialidad de los datos e información intercambiados entre ellas, incluyendo información objeto de derechos de autor, patentes técnicas, modelos, invenciones, know-how, procesos, algoritmos, programas, ejecutables, investigaciones, detalles de diseño, información financiera, lista de clientes, proveedores, inversionistas, empleados, relaciones de negocios y contractuales; pronósticos de negocios, planes de mercadeo, metodologías de viabilización técnica y/o financiera propia, modelos de negocio, así como cualquier información revelada en el desarrollo del presente contrato de suministro sobre terceras personas. Las partes acuerdan que cualquier información intercambiada, facilitada o creada entre ellas en la ejecución del presente contrato, será mantenida en estricta confidencialidad, aún después de vencido o terminado el plazo definido en el mismo. La parte receptora correspondiente sólo podrá revelar información confidencial a quienes la necesiten y estén autorizados previamente por la parte de cuya información confidencial se trata.
            </p>

            <h3 className="font-bold mt-4">Parágrafo Primero. Sanciones por Violar el Acuerdo de Confidencialidad:</h3>
            <p className="mb-4">
              Si alguna de las partes viola alguna de las disposiciones antes mencionadas en relación con lo que se considera objeto de la Confidencialidad, ocasionará el pago de una multa de $ 100.000.000 COP, sin perjuicio de las demás acciones laborales, comerciales y penales a que haya lugar para la reclamación de indemnización de perjuicios ocasionados con la violación a la Confidencialidad aquí suscrita.
            </p>

            <h3 className="font-bold mt-4">Parágrafo Segundo:</h3>
            <p className="mb-4">
              Esta misma sanción se aplicará en caso de que el <strong>{auth.firstName} {auth.lastName}</strong> contacte al arrendatario de su vehículo a través de medios diferentes a la plataforma TREASAPP una vez terminado el contrato de Arrendamiento.
            </p>

            <h3 className="font-bold mt-4">DÉCIMA CUARTA. Solución de controversias:</h3>
            <p className="mb-4">
              Las controversias o diferencias que surjan entre las partes con ocasión de la firma, ejecución, interpretación o terminación del Contrato, así como de cualquier otro asunto relacionado con el presente Contrato, serán sometidas a la revisión de las partes para buscar un arreglo directo, en un término no mayor a cinco (5) días hábiles a partir de la fecha en que cualquiera de las partes comunique por escrito a la otra la existencia de una diferencia.
            </p>

            <p className="mb-4">
              Las controversias que no puedan ser resueltas de forma directa entre las partes, se resolverán mediante un procedimiento conciliatorio que se surtirá ante la CÁMARA DE COMERCIO DE BOGOTÁ, previa solicitud de conciliación elevada individual o conjuntamente por las Partes. Si en el término de ocho (8) días hábiles a partir del inicio del trámite de la conciliación, el cual se entenderá a partir de la fecha de la primera citación a las Partes que haga CÁMARA DE COMERCIO, las Partes no llegan a un acuerdo para resolver sus diferencias deben acudir a la jurisdicción competente.
            </p>

            <p className="mb-4">
            En señal de conformidad las partes suscriben el presente documento de manera digital a los ({day}) días del mes de {month} del año {year}.
            </p>
          </Typography>

          <div className="flex justify-between mt-8">
            <div className="text-center">
              <Typography variant="body1">
                <div style={{ position: 'relative', display: 'inline-block', textAlign: 'center' }}>
                  <img
                    src={FirmaGerente}
                    alt="Firma del Gerente"
                    style={{ width: '300px', height: '80px', objectFit: 'cover', position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)' }}
                  />
                  <p style={{ borderTop: '1px solid black', marginTop: '25px' }}>TREAS CORP S.A.S</p>
                  <p>Nombre: Erixon Chaparro Martínez</p>
                  <p>Cargo: Gerente General</p>
                </div>
              </Typography>
            </div>
            <div className="text-center">
              <Typography variant="body1">
                <p className="mb-4">________________________________________</p>
                <p>{auth.firstName} {auth.lastName}</p>
                <p>No. de Cédula: {auth.verifyId}</p>
              </Typography>
            </div>
          </div>
        </div>
      </div>
      <div>
        <PDFDownloadLink
          document={<MyDocument />}
          fileName="Contrato_Alquiler_Hosting_Procesamiento_Datos.pdf"
          className="bg-red_treas hover:bg-red-700 text-white px-4 py-2 rounded-full mt-4"
        >
          {({ loading }) => (loading ? 'Generando PDF...' : 'Descargar PDF')}
        </PDFDownloadLink>
      </div>
      </>
         ) : (
          <>
        <div className="p-10 text-sm leading-normal font-helvetica">
  <h1 className="text-xl text-center mb-5 font-bold uppercase">
    CONTRATO DE PRESTACIÓN DE SERVICIOS DE TRANSPORTE ESPECIAL DECRETO 1079 DE 2015 MODIFICADO POR EL 0431 DE 2017 (DECRETOS MINISTERIO DE TRANSPORTE) 
    CONTRATO
  </h1>
  <p className="text-center mb-5 font-bold">
    {auth.uid}
    hola
  </p>

  <div className="mb-2">
    <p className="text-justify mb-2">
      Entre los suscritos a saber <span className="font-bold">JAVIER JARAMILLO SANMIGUEL</span> mayor de edad identificado con Cédula de Ciudadanía No. 80.872.720 de Bogotá y domiciliado en Bogotá actuando en nombre y representación de la empresa <span class="font-bold">TREAS CORP SAS</span> NIT. 901.656.494-9 con domicilio en la Av. Calle 100 # 8a – 55 World Trade Center Torre C en Bogotá y que para el presente contrato se denominará EL CONTRATANTE y por otra parte <span class="font-bold">{auth.firstName} {auth.lastName} {auth.lastName}</span> mayor de edad identificado con Cédula de Ciudadanía No. {auth.docNumber} quien actúa como Representante Legal de la Empresa {auth.CompanyName}. Identificado(a) con Nit. {auth.NIT} domiciliado en {auth.addresCompany} en {auth.cityCompany} quien para efectos del presente contrato se denominará EL CONTRATISTA hemos acordado celebrar el presente contrato de Prestación de Servicios para desarrollar actividades relacionadas con el Servicio Público de Transporte Especial de Pasajeros y Mensajería regulado por las normas y disposiciones vigentes en la República de Colombia para este tipo de contrataciones y en especial las contenidas en el Código Civil y enmarcado dentro de las siguientes cláusulas:
    </p>
  </div>

  <div className="mb-2">
    <h2 className="text-base mt-2 mb-1 font-bold uppercase">PRIMERA: OBJETO</h2>
    <p className="text-justify mb-2">
      El contratista se compromete a prestar al Grupo Especifico de Usuarios del contratante el servicio de transporte la vigilancia y control de la normatividad del servicio de transporte especial de pasajeros así lo anterior como beneficio a nuestro grupo de Miembros de la empresa.
      &quot; TRANSPORTE DE PERSONAL, FUNCIONARIOS, CONTRATISTAS, EMPRESARIOS, MIEMBROS Y CLIENTES ASIGNADOS
      PREVIAMENTE POR LA EMPRESA TREAS CORP SAS Y CUYOS OCUPANTES AL MENOS UNO DEBE ESTAR DEBIDAMENTE
      CARNETIZADO CON NUESTRA EMPRESA TREASCORP SAS CON NOMBRE Y NÚMERO DE CÉDULA.
      POR EL PERÍMETRO URBANO EN BOGOTÁ D.C, SUS 20 LOCALIDADES Y AEROPUERTO EL DORADO&quot; SALIENDO DE BOGOTÁ
      A LOS SIGUIENTES MUNICIPIOS DEL DEPARTAMENTO DE CUNDINAMARCA Y AEROPUERTO ELDORADO, TERMINALES DE
      TRANSPORTE TERRESTRE: CHÍA, CAJICA, COTA, SIBERIA, FUNZA, MOSQUERA, MADRID, FACATATIVÁ, ALBÁN, SASAIMA,
      MELGAR, FLANDES, ESPINAL, GUALANDAY, IBAGUÉ, VILLETA, GUADUAS, PUERTO BOYACÁ, SOACHA, GRANADA,
      SILVANIA, FUSAGASUGÁ, CHINAUTA, MELGAR, BOQUERÓN, LA MESA, MESITAS, RICAURTE, GIRARDOT, ANAPOIMA,
      APULO, TOCAIMA, TABIO, TENJO, BRICEÑO, TOCANCIPÁ, GACHANCIPÁ, SESQUILÉ, CHOCONTÁ, VILLA PINZÓN,
      GUATEQUE, PUENTE PIEDRA, EL ROSAL, EL VINO, SAN FRANCISCO, LA VEGA, NOCAIMA, VILLETA, GUADUAS, ZIPAQUIRÁ,
      SOPÓ, GUATAVITA, LA CALERA, QUEBRADANERGA, UTICA, YACOPI, LA AGUADA, EL PEÑÓN, CARAPEGUA, SUSATAUSA,
      UBATÉ, FUQUENE, SIMIJACA, Y SUSA.
    </p>
  </div>
  <div className="mb-5">
  <div className="mb-2">
    <div className="flex mb-1">
      <span className="font-bold w-1/3">TIPO:</span>
      <span className="w-2/3">{auth.vehicleForm}</span>
    </div>
    <div className="flex mb-1">
      <span className="font-bold w-1/3">PLACA:</span>
      <span className="w-2/3">{auth.vehicleNumber}</span>
    </div>
    <div className="flex mb-1">
      <span className="font-bold w-1/3">MARCA:</span>
      <span className="w-2/3">{auth.vehicleMake}</span>
    </div>
    <div className="flex mb-1">
      <span className="font-bold w-1/3">NOMBRE DEL CONDUCTOR:</span>
      <span className="w-2/3">{auth.firstName} {auth.lastName} {auth.lastName}</span>
    </div>
    <div className="flex mb-1">
      <span className="font-bold w-1/3">CEDULA DEL CONDUCTOR:</span>
      <span className="w-2/3">{auth.verifyId}</span>
    </div>
  </div>
</div>


  <div className="mb-5">
    <h2 className="text-base mt-2 mb-1 font-bold uppercase">SEGUNDA: OBLIGACIONES DEL CONTRATISTA</h2>
    <p className="text-justify mb-1">
      Son obligaciones las siguientes:
    </p>
    <p className="text-justify mb-1">1) Contar con personal idóneo y calificado que cumpla con los requisitos de movilidad.</p>
    <p className="text-justify mb-1">2) Realizar las actividades teniendo en cuenta las disposiciones legales dictadas por el Ministerio de Transporte y Medio Ambiente vigentes.</p>
    <p className="text-justify mb-1">3) Deberá cumplir con todos los requisitos para la libre circulación y prestación de servicio de transportes exigidos por el Ministerio de Transporte y demás entidades que regulan esta clase de transporte. Este requisito es aplicable tanto para los vehículos como para los conductores.</p>
    <p className="text-justify mb-1">4) El vehículo debe tener vigentes durante la ejecución del contrato los siguientes documentos: Tarjeta de operación, Soat, Tarjeta de Propiedad, Revisión Técnico-mecánica y los demás documentos exigidos por las autoridades de tránsito para la prestación de este servicio.</p>
    <p className="text-justify mb-1">5) Se obliga al cumplimiento de todas las leyes laborales vigentes y al pago por su cuenta de todos los salarios prestaciones sociales de Ley y deberá afiliar a los conductores al sistema de seguridad social en salud pensión ARL y cajas de compensación.</p>
  </div>

  <div className="mb-2">
    <h2 className="text-base mt-2 mb-1 font-bold uppercase">TERCERA: CONDICIONES DEL VEHÍCULO</h2>
    <p className="text-justify mb-1">
      Para el óptimo servicio EL CONTRATISTA se obliga a emplear los vehículos que cumplan con las siguientes características:
    </p>
    <p className="text-justify mb-1">
      1) Vehículo tipo {auth.vehicleType} con aire acondicionado con equipo de sonido con capacidad máxima de {auth.vehicleCapacity} personas INCLUIDO EL CONDUCTOR sentadas cómodamente, teléfono celular dotado con el botiquín de primeros auxilios y equipo de carretera.
    </p>
    <p className="text-justify mb-1">2) El vehículo deberá mantenerse en perfectas condiciones mecánicas de mantenimiento, pintura, tapizado, aseo, higiene y presentación general.</p>
  </div>

  <div className="mb-2">
    <h2 className="text-base mt-2 mb-1 font-bold uppercase">CUARTA: VIGENCIA DE CONTRATO</h2>
    <p className="text-justify mb-1">
    El contrato empresarial de prestación de servicios tendrá vigencia desde {startDate} hasta el {formattedEndDate}.
    </p>
  </div>

  <div className="mb-2">
    <h2 className="text-base mt-2 mb-1 font-bold uppercase">QUINTA: TERMINACIÓN DEL CONTRATO</h2>
    <p className="text-justify mb-1">
      El presente contrato termina por voluntad de las partes de común acuerdo. En forma unilateral cuando alguna de las partes incumpla con alguna de las condiciones y obligaciones establecidas en este contrato.
    </p>
  </div>
  <div className="mb-2">
    
    <p className="text-justify mb-1">
    Para constancia se firma por las partes en dos ejemplares del mismo tenor, en la ciudad de Bogotá a los
    un ({day}) días del mes de  {month} del año {year}.    </p>
  </div>
 
  <div className="mt-10 flex justify-between items-center">
    <div className="text-center w-2/5">
      <div className="border-t border-black mt-6 pt-2"></div>
      <p className="mt-2">REPRESENTANTE LEGAL</p>
      <p className="mt-2">{auth.Full_Name_Legal_Representative}</p>
      <p className="mt-2">C.C. {auth.verifyIdRepresentativeLegal}</p>
      
      <p className="mt-2">{auth.CompanyName}</p>
    </div>
    <div className="text-center w-2/5">
      <img src={FirmaGerente} alt="Firma Gerente" className="w-44 h-24 mb-10 mx-auto" />
      <div className="border-t border-black mt-6 pt-2"> Firma por poder.</div>
      <p className="mt-2"> ERIXON CHAPARRO MARTÍNEZ</p>
      <p className="mt-2">C.C. 80.024.555 de Bogotá</p>
      <p className="mt-2">GERENTE GENERAL</p>
      <p className="mt-2">TREAS CORP SAS</p>
    </div>
  </div>
</div>

    
        
          <div>
            <PDFDownloadLink
              document={<MyDocument />}
              fileName="Contrato_Transporte_Especial.pdf"
              className="bg-red_treas hover:bg-red-700 text-white px-4 py-2 rounded-full mt-4"
            >
              {({ loading }) => (loading ? 'Generando PDF...' : 'Descargar PDF')}
            </PDFDownloadLink>
          </div>
          </>
        )}
    </div>
  );
};

export default ContractDisplay;
