from pydantic import BaseModel, EmailStr

class ParticipanteCreate(BaseModel):
    email: EmailStr
    nombre: str
    apellido: str
    campo1: str | None = None
    campo2: str | None = None
    campo3: str | None = None

class EncuestaCreate(BaseModel):
    titulo: str

class PreguntaCreate(BaseModel):
    texto: str

class OpcionCreate(BaseModel):
    texto: str
