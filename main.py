from fastapi import FastAPI, Request, Depends, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
import json

from .db import Base, engine, get_db
from .models import Participante, Encuesta, Pregunta, Opcion, Voto

app = FastAPI()
templates = Jinja2Templates(directory="app/templates")

Base.metadata.create_all(bind=engine)

# ================= HOME =================
@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse("home.html", {"request": request})


# ================= ENCUESTA =================
@app.get("/encuesta", response_class=HTMLResponse)
def encuesta_inicio(request: Request, db: Session = Depends(get_db)):
    encuestas = db.query(Encuesta).all()
    return templates.TemplateResponse(
        "encuesta.html",
        {"request": request, "encuestas": encuestas}
    )


# ================= VOTAR (GET ÚNICO) =================
@app.get("/votar", response_class=HTMLResponse)
def votar(
    request: Request,
    email: str | None = None,
    encuesta_id: int | None = None,
    db: Session = Depends(get_db)
):
    # 👉 Si entran sin parámetros, redirige bonito
    if not email or not encuesta_id:
        return RedirectResponse("/encuesta", status_code=302)

    email = email.strip().lower()

    participante = db.query(Participante).filter_by(email=email).first()
    if not participante:
        return HTMLResponse("<h3>❌ Correo no registrado</h3>")

    pregunta = db.query(Pregunta).filter_by(encuesta_id=encuesta_id).first()
    if not pregunta:
        return HTMLResponse("<h3>❌ Esta encuesta no tiene preguntas</h3>")

    ya_voto = db.query(Voto).filter_by(
        participante_id=participante.id,
        pregunta_id=pregunta.id
    ).first()

    if ya_voto:
        return HTMLResponse("<h3>⚠️ Este correo ya votó</h3>")

    opciones = db.query(Opcion).filter_by(pregunta_id=pregunta.id).all()

    return templates.TemplateResponse(
        "votar.html",
        {
            "request": request,
            "email": email,
            "encuesta_id": encuesta_id,
            "pregunta": pregunta,
            "opciones": opciones
        }
    )


# ================= VOTAR (POST) =================
@app.post("/votar")
def guardar_voto(
    email: str = Form(...),
    encuesta_id: int = Form(...),
    opcion_id: int = Form(...),
    db: Session = Depends(get_db)
):
    email = email.strip().lower()

    participante = db.query(Participante).filter_by(email=email).first()
    pregunta = db.query(Pregunta).filter_by(encuesta_id=encuesta_id).first()

    if not participante or not pregunta:
        return HTMLResponse("❌ Error al votar")

    ya_voto = db.query(Voto).filter_by(
        participante_id=participante.id,
        pregunta_id=pregunta.id
    ).first()

    if ya_voto:
        return HTMLResponse("⚠️ Ya votaste")

    voto = Voto(
        participante_id=participante.id,
        pregunta_id=pregunta.id,
        opcion_id=opcion_id
    )
    db.add(voto)
    db.commit()

    return RedirectResponse("/reporte", status_code=302)

# ================= REPORTE =================
@app.get("/reporte", response_class=HTMLResponse)
def reporte(
    request: Request,
    db: Session = Depends(get_db),
    encuesta_id: int | None = None,
    success: int = 0,
):
    # Si no mandan encuesta_id, muestro pantalla para elegir encuesta
    if encuesta_id is None:
        encuestas = db.query(Encuesta).all()
        return templates.TemplateResponse(
            "seleccionar_encuesta.html",
            {"request": request, "encuestas": encuestas}
        )

    encuesta = db.query(Encuesta).filter_by(id=encuesta_id).first()
    if not encuesta:
        return HTMLResponse("❌ Encuesta no encontrada")

    preguntas = db.query(Pregunta).filter_by(encuesta_id=encuesta_id).all()
    if not preguntas:
        return HTMLResponse("❌ Esta encuesta no tiene preguntas")

    resultados_finales = []

    for pregunta in preguntas:
        opciones = db.query(Opcion).filter_by(pregunta_id=pregunta.id).all()
        total = db.query(Voto).filter_by(pregunta_id=pregunta.id).count()

        resultados = []
        for o in opciones:
            votos = db.query(Voto).filter_by(
                pregunta_id=pregunta.id,
                opcion_id=o.id
            ).count()

            porcentaje = (votos / total * 100) if total > 0 else 0
            resultados.append({
                "opcion": o.texto,
                "votos": votos,
                "porcentaje": round(porcentaje, 2)
            })

        resultados_finales.append({
            "pregunta": pregunta.texto,
            "resultados": resultados,
            "total": total
        })

    return templates.TemplateResponse(
        "resultado.html",
        {
            "request": request,
            "encuesta": encuesta.titulo,
            "resultados_finales": resultados_finales,
            "success": success
        }
    )

# ================= PARTICIPANTES =================
@app.get("/participantes", response_class=HTMLResponse)
def participantes_page(request: Request, db: Session = Depends(get_db)):
    participantes = db.query(Participante).order_by(Participante.id.desc()).all()
    return templates.TemplateResponse(
        "participantes.html",
        {"request": request, "participantes": participantes}
    )


@app.post("/participantes")
def crear_participante(
    email: str = Form(...),
    nombre: str = Form(...),
    apellido: str = Form(...),
    campo1: str = Form(None),
    campo2: str = Form(None),
    campo3: str = Form(None),
    db: Session = Depends(get_db)
):
    email = email.strip().lower()
    existe = db.query(Participante).filter_by(email=email).first()
    if not existe:
        p = Participante(email=email, nombre=nombre, apellido=apellido)
        db.add(p)
        db.commit()
    return RedirectResponse("/participantes", status_code=302)


# ================= ADMIN =================
@app.get("/admin/encuesta", response_class=HTMLResponse)
def admin_encuesta(request: Request, db: Session = Depends(get_db)):
    encuestas = db.query(Encuesta).all()
    return templates.TemplateResponse(
        "admin_encuesta.html",
        {"request": request, "encuestas": encuestas}
    )


@app.post("/admin/encuesta")
def crear_encuesta(titulo: str = Form(...), db: Session = Depends(get_db)):
    encuesta = Encuesta(titulo=titulo)
    db.add(encuesta)
    db.commit()
    return RedirectResponse("/admin/encuesta", status_code=302)


@app.get("/admin/pregunta", response_class=HTMLResponse)
def admin_pregunta(request: Request, db: Session = Depends(get_db)):
    return templates.TemplateResponse(
        "admin_pregunta.html",
        {
            "request": request,
            "encuestas": db.query(Encuesta).all(),
            "preguntas": db.query(Pregunta).all(),
            "opciones": db.query(Opcion).all()
        }
    )


@app.post("/admin/pregunta")
def crear_pregunta(encuesta_id: int = Form(...), texto: str = Form(...), db: Session = Depends(get_db)):
    db.add(Pregunta(encuesta_id=encuesta_id, texto=texto))
    db.commit()
    return RedirectResponse("/admin/pregunta", status_code=302)


@app.post("/admin/opcion")
def crear_opcion(pregunta_id: int = Form(...), texto: str = Form(...), db: Session = Depends(get_db)):
    db.add(Opcion(pregunta_id=pregunta_id, texto=texto))
    db.commit()
    return RedirectResponse("/admin/pregunta", status_code=302)

@app.post("/admin/pregunta/eliminar")
def eliminar_pregunta(
    pregunta_id: int = Form(...),
    db: Session = Depends(get_db)
):
    pregunta = db.query(Pregunta).filter_by(id=pregunta_id).first()

    if not pregunta:
        return HTMLResponse("❌ Pregunta no encontrada")

    # Eliminar primero votos
    db.query(Voto).filter_by(pregunta_id=pregunta.id).delete()

    # Eliminar opciones
    db.query(Opcion).filter_by(pregunta_id=pregunta.id).delete()

    # Eliminar la pregunta
    db.delete(pregunta)
    db.commit()

    return RedirectResponse("/admin/pregunta", status_code=302)
@app.post("/participantes/eliminar")
def eliminar_participante(
    participante_id: int = Form(...),
    db: Session = Depends(get_db)
):
    participante = db.query(Participante).filter_by(id=participante_id).first()

    if not participante:
        return HTMLResponse("❌ Participante no encontrado")

    # Eliminar votos asociados al participante
    db.query(Voto).filter_by(participante_id=participante.id).delete()

    # Eliminar participante
    db.delete(participante)
    db.commit()

    return RedirectResponse("/participantes", status_code=302)
@app.post("/admin/opcion/eliminar")
def eliminar_opcion(
    opcion_id: int = Form(...),
    db: Session = Depends(get_db)
):
    opcion = db.query(Opcion).filter_by(id=opcion_id).first()

    if not opcion:
        return HTMLResponse("❌ Opción no encontrada")

    # eliminar votos asociados
    db.query(Voto).filter_by(opcion_id=opcion.id).delete()

    db.delete(opcion)
    db.commit()

    return RedirectResponse("/admin/pregunta", status_code=302)
@app.get("/estadisticas", response_class=HTMLResponse)
def estadisticas(request: Request, db: Session = Depends(get_db)):
    total_participantes = db.query(Participante).count()
    total_votos = db.query(Voto).count()
    total_encuestas = db.query(Encuesta).count()

    return templates.TemplateResponse(
        "estadisticas.html",
        {
            "request": request,
            "total_participantes": total_participantes,
            "total_votos": total_votos,
            "total_encuestas": total_encuestas
        }
    )
@app.get("/historial", response_class=HTMLResponse)
def historial(request: Request, db: Session = Depends(get_db)):
    encuestas = db.query(Encuesta).all()

    return templates.TemplateResponse(
        "historial.html",
        {
            "request": request,
            "encuestas": encuestas
        }
    )
@app.get("/encuestas_activas", response_class=HTMLResponse)
def encuestas_activas(request: Request, db: Session = Depends(get_db)):
    encuestas = db.query(Encuesta).all()

    return templates.TemplateResponse(
        "encuestas_activas.html",
        {
            "request": request,
            "encuestas": encuestas
        }
    )
# =========================
# ADMIN - ELIMINAR ENCUESTA
# =========================
@app.post("/admin/encuesta/eliminar")
def eliminar_encuesta(
    encuesta_id: int = Form(...),
    db: Session = Depends(get_db)
):
    encuesta = db.query(Encuesta).filter_by(id=encuesta_id).first()

    if not encuesta:
        return HTMLResponse("❌ Encuesta no encontrada")

    # eliminar votos
    preguntas = db.query(Pregunta).filter_by(encuesta_id=encuesta_id).all()
    for p in preguntas:
        db.query(Voto).filter_by(pregunta_id=p.id).delete()
        db.query(Opcion).filter_by(pregunta_id=p.id).delete()

    db.query(Pregunta).filter_by(encuesta_id=encuesta_id).delete()
    db.delete(encuesta)
    db.commit()

    return RedirectResponse("/encuestas_activas", status_code=302)




