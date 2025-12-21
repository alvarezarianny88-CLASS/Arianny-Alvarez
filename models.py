from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from .db import Base

class Participante(Base):
    __tablename__ = "participantes"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    nombre = Column(String)
    apellido = Column(String)

class Encuesta(Base):
    __tablename__ = "encuestas"
    id = Column(Integer, primary_key=True)
    titulo = Column(String)

class Pregunta(Base):
    __tablename__ = "preguntas"
    id = Column(Integer, primary_key=True)
    encuesta_id = Column(Integer, ForeignKey("encuestas.id"))
    texto = Column(String)

class Opcion(Base):
    __tablename__ = "opciones"
    id = Column(Integer, primary_key=True)
    pregunta_id = Column(Integer, ForeignKey("preguntas.id"))
    texto = Column(String)

class Voto(Base):
    __tablename__ = "votos"
    id = Column(Integer, primary_key=True)
    participante_id = Column(Integer, ForeignKey("participantes.id"))
    pregunta_id = Column(Integer, ForeignKey("preguntas.id"))
    opcion_id = Column(Integer, ForeignKey("opciones.id"))

    __table_args__ = (
        UniqueConstraint("participante_id", "pregunta_id"),
    )
