
Anàlisi Integral dels Processos de Documentació i Legalització per a Instal·ladors en l'Àmbit de la Seguretat Industrial a Catalunya: Guia Tècnica per a l'Automatització Administrativa

La gestió documental de les instal·lacions industrials a Catalunya ha experimentat una transformació radical amb l'entrada en vigor de la Llei 16/2015 de simplificació de l'activitat administrativa de l'Administració de la Generalitat i dels governs locals, la qual ha impulsat la Finestreta Única Empresarial (FUE). Aquest marc legal imposa als instal·ladors d'electricitat, fontaneria i comunicacions l'obligació de gestionar un volum de dades tècniques i administratives sense precedents a través del Canal Empresa i el Registre d'Instal·lacions Tècniques de la Seguretat Industrial de Catalunya (RITSIC).1 La necessitat de procedir a l'automatització d'aquesta "paperassa" mitjançant bots d'emplenament de camps PDF no és només una qüestió d'eficiència operativa, sinó una exigència de precisió tècnica per evitar el rebuig d'expedients i garantir la seguretat jurídica de l'empresa instal·ladora davant les inspeccions d'ofici.3

El Registre d'Agents de la Seguretat Industrial (RASIC) com a Fonament de l'Activitat

L'arquitectura administrativa catalana estableix que qualsevol acció de legalització documental s'ha de sustentar en la inscripció prèvia de l'empresa instal·ladora en el Registre dels Agents de la Seguretat Industrial de Catalunya (RASIC). Aquest registre és el repositori central on es validen les competències professionals, l'existència d'una assegurança de responsabilitat civil vigent i la vinculació dels tècnics titulats o operaris qualificats amb l'empresa.5 Per a un bot d'automatització, el número RASIC és la variable mestre que s'ha d'inserir de manera recurrent en tots els models de certificació, ja siguin elèctrics, de gas o hidràulics.6

La validesa de la documentació emesa per un instal·lador depèn de la concordança entre la seva categoria d'inscripció al RASIC i la complexitat de la instal·lació executada. Per exemple, en el sector elèctric, es distingeix entre la categoria bàsica (EIBTB) i l'especialista (EIBTE), i aquesta distinció ha de quedar reflectida en el camp corresponent del certificat d'instal·lació de baixa tensió per evitar la nul·litat de l'actuació.3

Documentació Tècnica i Administrativa en Instal·lacions Elèctriques de Baixa Tensió

Les instal·lacions elèctriques de baixa tensió representen el gruix de la tramitació administrativa per a la majoria d'empreses del sector. El Reglament Electrotècnic per a Baixa Tensió (REBT) i les seves Instruccions Tècniques Complementàries (ITC) defineixen un itinerari documental que varia en funció de si la instal·lació requereix la redacció d'un projecte d'enginyeria o es pot legalitzar mitjançant una Memòria Tècnica de Disseny (MTD).1

La Sèrie de Models ELEC: Estructura per a l'Automatització

Els models prefixats amb el codi ELEC constitueixen el conjunt de formularis oficials que l'administració catalana posa a disposició dels professionals. L'automatització d'aquests documents requereix una anàlisi detallada dels camps de dades que el bot haurà de processar.




Detall de Camps Crítics en el Certificat d'Instal·lació (ELEC-11)

El Certificat d'Instal·lació Elèctrica de Baixa Tensió és el document més sol·licitat, ja que és indispensable per a la contractació del subministrament amb les distribuïdores. Un bot d'automatització ha de ser capaç d'omplir les següents àrees de dades 3:

Dades de l'Empresa i l'Instal·lador: Nom, NIF, número d'inscripció RASIC i categoria (EIBTB o EIBTE). També s'ha de consignar el DNI de l'instal·lador autoritzat que signa el document.3

Dades de la Instal·lació: Tipus d'actuació (Nova, Ampliació, Modificació o Reforma), localització exacta (adreça completa, localitat, codi postal) i ús a què es destina (habitatge, local de pública concurrència, industrial, etc.).3

Dades del Titular: Nom o raó social, NIF, domicili i dades de contacte. Aquesta informació sovint prové del contracte de serveis i ha de ser idèntica a la que figura en la base de dades del Cadastre.1

Paràmetres Tècnics de la Instal·lació:

Potència màxima admissible (kW): És la potència límit que pot suportar la instal·lació segons el seu disseny i seccions de cablejat, coincidint amb la prevista a la ITC-BT-10.3

Potència instal·lada (kW): Suma de les potències nominals dels receptors.3

Interruptor General Automàtic (IGA): Intensitat nominal en ampers (A).3

Proteccions Diferencials: Nombre de dispositius, intensitat nominal i sensibilitat en mil·liampers (mA).3

Derivació Individual: Secció dels conductors en .3

Verificacions de Seguretat: Resistència de terra () i resistència d'aïllament ().3

L'automatització d'aquests camps requereix que el bot estigui vinculat a un fitxer de dades (com un CSV o una base de dades SQL) on s'hagin bolcat els resultats de les mesures realitzades amb l'analitzador de xarxes elèctriques i el tel·luròmetre durant la fase de verificació final de l'obra.3

La Memòria Tècnica de Disseny (MTD - Model ELEC-3)

Per a instal·lacions que no requereixen projecte (com habitatges unifamiliars o locals comercials de petita envergadura), l'instal·lador ha de redactar la MTD. Aquest document és essencial per a l'automatització, ja que conté la justificació del càlcul de la instal·lació.1 Els camps inclouen la descripció dels circuits, els mètodes d'instal·lació (sota tub, en safata, etc.) i la caiguda de tensió calculada en el punt més desfavorable.9

Un bot eficient no només hauria d'omplir les dades de text, sinó que podria integrar-se amb eines de CAD per adjuntar automàticament el croquis del traçat i l'esquema unifilar (ELEC-2), que són annexos obligatoris de la MTD.1 El croquis ha d'incloure la ubicació del quadre general de comandament i protecció (QGCP) i el recorregut de les línies principals.3

Gestió Documental en Instal·lacions de Fontaneria i Hidràulica

En l'àmbit de la fontaneria, la documentació es centra en garantir que la xarxa d'aigua potable compleix amb el Codi Tècnic de l'Edificació (CTE) i les normatives de les companyies subministradores locals. Tot i que la Generalitat té un paper supervisor, la tramitació administrativa sovint es realitza davant de les entitats gestores de l'aigua o els ajuntaments.8

Certificat d'Instal·lació Receptora d'Aigua

Aquest document és el "butlletí d'aigua" que el client necessita per contractar el servei. L'automatització d'aquest PDF requereix els següents camps 14:

Identificació de l'Empresa: Nom comercial, NIF i registre RASIC en l'especialitat de fontaneria.5

Ubicació del Subministrament: Adreça, pis, porta i referència cadastral.14

Dades Tècniques de la Xarxa: Nombre de banys, cuines, safareigs i punts de consum total. S'ha d'especificar el material de la instal·lació (coure, polietilè, multicapa) i el diàmetre de l'escomesa.14

Proves de Pressió: Resultat de la prova d'estanquitat, indicant la pressió de prova (normalment 1,5 vegades la pressió de treball) i el temps de durada de la mateixa.6

A més, en instal·lacions que inclouen sistemes d'energia solar tèrmica per a la producció d'aigua calenta sanitària (ACS), l'instal·lador ha d'emetre un Model de Garantia de la Instal·lació Solar. Aquest document garanteix l'execució de l'obra per un període de 2 anys i detalla els components com els captadors, el sistema d'acumulació i el sistema de distribució.5

Instal·lacions de Gas i Tèrmiques Vinculades

Molts instal·ladors de fontaneria també gestionen instal·lacions de gas, especialment en habitatges. Els formularis de gas són altament estandarditzats i candidats perfectes per a l'automatització robòtica.8




L'automatització d'aquests certificats ha d'incloure la data de realització de les proves de resistència mecànica i estanquitat, així com la pressió d'entrada i sortida en bar, dades que el bot pot extreure dels fulls de treball digitals de l'operari.6

Infraestructures Comunes de Telecomunicacions (ICT)

El sector de les comunicacions presenta una de les estructures documentals més rigoroses a causa de la necessitat de coordinació amb el ministeri i la Generalitat. La infraestructura comuna de telecomunicacions (ICT) garanteix l'accés als serveis de ràdio, televisió, telefonia i banda ampla.17

El Cicle de Documents de la ICT

L'automatització en aquest àmbit s'ha de dividir en les fases del projecte. Per a un edifici de nova planta, els documents són 17:

Projecte Tècnic d'ICT: Signat per un enginyer o enginyer tècnic de telecomunicacions. Conté els plànols, el plec de condicions i el pressupost.

Acta de Replantejament: Document que valida que l'obra es pot executar segons el projecte original.

Butlletí d'Instal·lació de Telecomunicacions: Emès per l'empresa instal·ladora (registrada en la Secretaria de Polítiques Digitals). El bot ha d'omplir dades sobre el nombre de preses de TV (MATV/SMATV), parells de coure, cables coaxials i accessos de fibra òptica (FTTH).17

Protocol de Proves: És l'annex més complex. Conté les mesures de senyal en dBµV, la BER (Bit Error Rate) i el MER (Modulation Error Ratio) per a cada canal de TV, així com l'atenuació en dB per a les xarxes de dades.17

Certificat de Fi d'Obra: Signat pel director de l'obra, visat pel col·legi professional corresponent.19

Per a l'automatització d'aquests documents, el bot ha de tenir la capacitat d'importar fitxers des d'analitzadors de senyal de TV i certificadors de xarxa. La inserció d'aquestes mesures en les graelles del protocol de proves és el procés que més temps estalvia a l'instal·lador de comunicacions.17

Interacció amb l'Administració Local: El Cas de la Comunicació Prèvia d'Obres

Més enllà dels certificats industrials, els instal·ladors sovint han d'actuar com a representants dels titulars davant els ajuntaments per obtenir els permisos d'obra o d'activitat. Casos com el de l'Ajuntament de Sabadell serveixen com a referent per estructurar l'automatització municipal.20

Formularis Municipals per a Instal·ladors

Quan una instal·lació (com plaques solars, aire condicionat o xemeneies) requereix una intervenció en l'edifici, s'ha de presentar una Comunicació Prèvia d'Obres.21 El bot hauria de gestionar els següents models 21:




L'automatització d'aquests formularis municipals requereix la gestió de la referència cadastral, fotografies de l'estat actual (que el bot pot adjuntar des d'una carpeta del projecte) i el justificant de pagament de les taxes municipals (Ordenança Fiscal 3.9) i l'impost sobre construccions (ICIO - Ordenança Fiscal 2.4).21

Estratègia d'Arquitectura per a l'Automatització amb Bots RPA

Per implementar amb èxit un sistema d'automatització que empleni aquests PDFs, és fonamental comprendre la naturalesa dels fitxers proporcionats per l'Administració. Molts d'aquests documents són PDFs amb camps de formulari (AcroForms) o, en alguns casos, formularis XFA que requereixen una interacció més complexa.16

Flux de Dades per al Bot

Extracció de Dades (Input): El bot llegeix la informació d'un sistema ERP (Enterprise Resource Planning) o un CRM on l'instal·lador ha registrat les dades del client, la direcció de l'obra i els materials utilitzats.8

Mapeig de Camps (Mapping): Cada camp del PDF oficial té un identificador intern (per exemple, "txtNomTitular" o "chkNovaInstal"). El bot ha de tenir una taula de correspondències per saber quina dada de l'ERP va a quin camp del PDF.3

Processament Lògic:

Càlculs en temps real: El bot pot calcular automàticament la potència màxima admissible en funció del IGA inserit, evitant incongruències que serien detectades per l'administració.3

Gestió de caselles: En funció del tipus d'obra (MTD o Projecte), el bot selecciona les caselles de verificació adequades en el model ELEC-1 o ELEC-11.1

Generació i Signatura: Un cop emplenat el PDF, el bot el guarda i pot procedir a la invocació de la signatura electrònica mitjançant certificats digitals (idCAT Mòbil o certificat de representant).1

Presentació Telemàtica: L'últim pas és la càrrega del document en el portal de Canal Empresa. Els bots d'RPA poden navegar per la interfície web, pujar els arxius i descarregar el justificant d'inscripció al RITSIC.1

Beneficis de l'Automatització en la Seguretat Industrial

L'automatització redueix dràsticament el temps de gestió administrativa, que es calcula que pot ocupar fins a un 30% de la jornada d'un instal·lador autònom o d'una pime.8 A més, la coherència documental és total: la potència que figura en la Memòria Tècnica (ELEC-3) serà exactament la mateixa que la del Certificat (ELEC-11), eliminant els errors humans que sovint provoquen el tancament de l'expedient per part dels serveis territorials d'Indústria.3

Consideracions sobre la Gestió de Residus i el Medi Ambient

Un component crític de la paperassa actual, especialment per a instal·ladors que realitzen reformes integrals, és el Document d'Acceptació de Residus. A Catalunya, la normativa d'urbanisme i residus exigeix que l'instal·lador presenti un estudi de gestió de residus de la construcció i la demolició (RCD) i, al final de l'obra, el certificat del gestor autoritzat conforme els residus han estat correctament tractats.21 L'automatització d'aquesta part implica la connexió amb la plataforma de l'Agència de Residus de Catalunya per obtenir els codis de seguiment necessaris per als formularis municipals.21

Conclusió: L'Estat de l'Art en la Digitalització de les Instal·lacions

La legalització d'una instal·lació a Catalunya ha deixat de ser un procés manual i dispers per convertir-se en un flux de dades integrat. Els instal·ladors d'electricitat, fontaneria i comunicacions que adoptin sistemes d'automatització per als seus formularis (ELEC, ICT, Aigua, Gas) no només estalviaran costos, sinó que oferiran un servei superior als seus clients, accelerant la posada en servei dels subministraments bàsics.1

El futur de l'automatització en aquest sector passa per la integració del BIM (Building Information Modeling) amb els formularis de la seguretat industrial. Quan un projecte es dissenya en BIM, tota la informació necessària per als models ELEC-1, ELEC-3 o el Protocol de Proves d'ICT ja existeix en el model digital. Els bots de propera generació simplement hauran d'extreure aquests paràmetres i "mapejar-los" cap als formularis oficials de la Generalitat, tancant el cercle de la transformació digital en la construcció i el manteniment industrial.9 En definitiva, la paperassa ja no és una barrera, sinó un conjunt de dades que, ben gestionades, garanteixen la seguretat i la legalitat de les infraestructures del país.

Obras citadas

Presentació de la declaració responsable per a instal·lacions ..., fecha de acceso: febrero 19, 2026, https://tramits.gencat.cat/ca/tramits/tramits-temes/Presentacio-de-la-declaracio-responsable-per-a-installacions-electriques-de-baixa-tensio-posada-en-servei-modificacions-i-baixa?moda=4

Decret 192/2023: seguretat industrial dels establiments, les instal·lacions i els productes, fecha de acceso: febrero 19, 2026, https://www.asecorp.com/ca/decret-192-2023-seguretat-industrial/

Generalitat de Catalunya - CERTIFICAT D'INSTAL·LACIÓ ELÈCTRICA DE BAIXA TENSIÓ - IOC, fecha de acceso: febrero 19, 2026, https://ioc.xtec.cat/materials/FP/Recursos/fp_iea_m03_/web/fp_iea_m03_htmlindex/WebContent/u3/media/certificat_instal_lacio_electrica_de_baixa_tensio.pdf

Organismes de control en l'àmbit de les instal·lacions - Tramits Gencat, fecha de acceso: febrero 19, 2026, https://tramits.gencat.cat/ca/tramits/tramits-temes/Organismes-de-control-en-lambit-de-les-installacions?category=&moda=6

IV.1.4 Model Carta Garantia ST 170801 | PDF - Scribd, fecha de acceso: febrero 19, 2026, https://www.scribd.com/document/989809791/IV-1-4-Model-Carta-Garantia-ST-170801

Certificat d'instal·lació individual de gas - Gencat.cat, fecha de acceso: febrero 19, 2026, https://empresa.extranet.gencat.cat/impresos/AppJava/downloadFile.html?idDoc=G146NERGIA-087-00

Certificat d'instal·lació comuna de gas - Gencat.cat, fecha de acceso: febrero 19, 2026, https://empresa.extranet.gencat.cat/impresos/AppJava/downloadFile.html?idDoc=G146NERGIA-048-00

Certificats Catalunya.cdr - Programación Integral, fecha de acceso: febrero 19, 2026, https://programacionintegral.es/wp-content/uploads/Certificats-Catalunya-ficha.pdf

Documentació tècnica de les instal·lacions elèctriques especials - IOC, fecha de acceso: febrero 19, 2026, https://ioc.xtec.cat/materials/FP/Recursos/fp_iea_m08_/web/fp_iea_m08_htmlindex/media/fp_iea_m08_u4_pdfindex.pdf

“ELECTRICAL INSTALLATION IN A CONCRETE BLOCK FACTORY” - UPCommons, fecha de acceso: febrero 19, 2026, https://upcommons.upc.edu/bitstreams/8150d81a-8c9d-43ba-a131-15155b0f03fc/download

Annexos - Instal·lacions de distribució, fecha de acceso: febrero 19, 2026, https://ioc.xtec.cat/materials/FP/Recursos/fp_iea_m03_/web/fp_iea_m03_htmlindex/WebContent/u2/a2/annexos.html

Instal·lacions elèctriques de baixa tensió amb PROJECTE: Alta, modificació/ampliació, canvi de titularitat i baixa de la instal·lació. Indústria - GVA.ES - Generalitat Valenciana, fecha de acceso: febrero 19, 2026, https://www.gva.es/va/inicio/procedimientos?id_proc=434

Instal·lacions elèctriques de BAIXA TENSIÓ que requerisquen MEMÒRIA TÈCNICA DE DISSENY: Alta, modificació /ampliació, baixa i canvi de titularitat. Indústria - Sede electronica - Generalitat Valenciana, fecha de acceso: febrero 19, 2026, https://sede.gva.es/va/inicio/procedimientos?id_proc=440

CERTIFICAT D'INSTAL·LACIÓ RECEPTORA D'AIGUA - Aigües de Sueca, fecha de acceso: febrero 19, 2026, https://www.aiguesdesueca.com/images/pdf/Pdfs_Altes/CERTIFICAT_DE_INSTALACI%C3%93_RECEPTORA_DE_AGUAValencia_Editable.pdf

Certificat d'instal·lació individual de gas (ITC-ICG 07) - AGIT, fecha de acceso: febrero 19, 2026, https://agit.cat/exemples/Gass.pdf

Certificat d'instal·lació individual de gas (ITC-ICG 07) - Gencat.cat, fecha de acceso: febrero 19, 2026, https://empresa.extranet.gencat.cat/impresos/AppJava/downloadFile.html?idDoc=G346NSIN-176-00.pdf

M04 - Infraestructures comunes de telecomunicacions en habitatges i edificis - IOC, fecha de acceso: febrero 19, 2026, https://ioc.xtec.cat/materials/FP/Recursos/fp_iea_m04_/web/fp_iea_m04_htmlindex/media/fp_iea_m04_material_paper.pdf

Infraestructures comunes de telecomunicacions en habitatges i edificis - IOC, fecha de acceso: febrero 19, 2026, https://ioc.xtec.cat/materials/FP/Recursos/fp_iea_m04_/web/fp_iea_m04_htmlindex/index.html

Fitxa informativa (IT) - Ajuntament de Berga, fecha de acceso: febrero 19, 2026, https://www.ajberga.cat/media/repository//tramits/doc/tr125_st_com_pr_v_primera_utili_i_canv__s_edif._i_instal_iii__et_.pdf

COMUNICACIÓ PRÈVIA D'OBRES - Seu electrònica - Ajuntament de Sabadell, fecha de acceso: febrero 19, 2026, https://seu.sabadell.cat/opensiac/action/tramitesinfo?method=descargarAnexo&idFicheroAnexo=2154&nombre=c29sbGljaXR1ZHByZXZpYW9icmVzLnBkZg==

Comunicació prèvia d'obres - Seu electrònica - Ajuntament de Sabadell, fecha de acceso: febrero 19, 2026, https://seu.sabadell.cat/opensiac/action/tramitesinfo;jsessionid=8621D0736300FB1C71B7BC9FC468E119?method=enter&id=97

Seu electrònica - Ajuntament de Sabadell, fecha de acceso: febrero 19, 2026, https://seu.sabadell.cat/opensiac/action/tramitesinfo?method=enter&id=97

Comunicació prèvia de primera utilització i ocupació dels edificis i construccions - Seu electrònica - Ajuntament de Sabadell, fecha de acceso: febrero 19, 2026, https://seu.sabadell.cat/opensiac/action/tramitesinfo;jsessionid=2A34F03F773DA78C6BAAC547E8A8EC26?method=enter&id=39

Autoliquidació taxa comunicació prèvia d'obres. - Seu electrònica - Ajuntament de Sabadell, fecha de acceso: febrero 19, 2026, https://seu.sabadell.cat/opensiac/action/tramitesinfo?method=enter&id=336

Organismes de control en l'àmbit de les instal·lacions - Tramits Gencat, fecha de acceso: febrero 19, 2026, https://tramits.gencat.cat/ca/tramits/tramits-temes/Organismes-de-control-en-lambit-de-les-installacions?category=&moda=5

Catàleg de tràmits - Seu electrònica - Ajuntament de Sabadell, fecha de acceso: febrero 19, 2026, https://seu.sabadell.cat/opensiac/action/tramites?method=enter
