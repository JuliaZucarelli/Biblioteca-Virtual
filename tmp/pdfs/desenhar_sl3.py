from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.colors import black, Color
from pathlib import Path
import math

out=Path('output/pdf/canon_sl3_vistas_ortogonais_A3.pdf')
c=canvas.Canvas(str(out),pagesize=(420*mm,297*mm))
c.setTitle('Canon EOS Rebel SL3 - Vistas ortogonais - estudo didático')
c.scale(mm,mm)
def line(x1,y1,x2,y2,w=.25):
 c.setLineWidth(w); c.line(x1,y1,x2,y2)
def text(x,y,s,size=8,bold=False):
 c.setFont('Helvetica-Bold' if bold else 'Helvetica',size/mm); c.drawString(x,y,s)
def poly(points,w=.5,close=True):
 c.setLineWidth(w); p=c.beginPath(); p.moveTo(*points[0])
 for a in points[1:]:p.lineTo(*a)
 if close:p.close()
 c.drawPath(p)
def rect(x,y,w,h,r=0,lw=.25):
 c.setLineWidth(lw)
 if r:c.roundRect(x,y,w,h,r)
 else:c.rect(x,y,w,h)
def circ(x,y,r,w=.25):
 c.setLineWidth(w);c.circle(x,y,r)
def axis(x1,y1,x2,y2):
 c.setDash([7,1.5,1,1.5]);line(x1,y1,x2,y2,.18);c.setDash([])
def arrow(x,y,dx,dy):
 poly([(x,y),(x+dx*2.4-dy*.65,y+dy*2.4+dx*.65),(x+dx*2.4+dy*.65,y+dy*2.4-dx*.65)],.18)
def dh(x1,x2,y,ref,label):
 line(x1,ref,x1,y+2,.18);line(x2,ref,x2,y+2,.18);line(x1,y,x2,y,.18);arrow(x1,y,1,0);arrow(x2,y,-1,0)
 c.setFont('Helvetica',8/mm);c.drawCentredString((x1+x2)/2,y+1.7,label)
def dv(y1,y2,x,ref,label):
 line(ref,y1,x-2,y1,.18);line(ref,y2,x-2,y2,.18);line(x,y1,x,y2,.18);arrow(x,y1,0,1);arrow(x,y2,0,-1)
 c.saveState();c.translate(x-1.7,(y1+y2)/2);c.rotate(90);c.setFont('Helvetica',8/mm);c.drawCentredString(0,0,label);c.restoreState()

rect(10,10,400,277,lw=.5)
text(20,276,'CANON EOS REBEL SL3',16,True)
text(20,269,'Vistas ortogonais do corpo | Estudo de desenho técnico',10)
text(316,277,'A3  |  420 × 297 mm',9)
text(316,270,'Projeção em 1º diedro',9,True)
# Front view: local origin at lower left, width 122.4 and height 92.6.
fx,fy=151,157
c.saveState();c.translate(fx,fy)
poly([(0,9),(0,64),(3,73),(10,77),(31,77),(39,81),(46,91),(51,92.6),(72,92.6),(78,90),(86,79),(104,77),(116,73),(122.4,66),(122.4,10),(119,3),(110,0),(12,0),(4,3)])
poly([(3,65),(8,73),(21,74),(28,69),(30,58),(28,12),(24,5),(10,4),(4,8)],.25)
poly([(38,76),(45,87),(51,89),(72,89),(79,85),(85,76),(80,71),(43,71)],.3)
text(48,77,'Canon',9,True)
for r in [32,29,26]:circ(64,35,r,.35)
rect(46,23,36,25,1,.25)
for a in range(225,316,10):
 t=math.radians(a);circ(64+24*math.cos(t),35+24*math.sin(t),.65,.18)
rect(99,28,6,13,2)
circ(98,61,2);rect(3,71,7,3,1);rect(112,71,7,3,1)
rect(11,76,12,3,1);text(107,52,'EOS',5);text(106,47,'SL3',6,True)
axis(25,35,103,35);axis(64,-5,64,72)
c.restoreState()
dh(fx,fx+122.4,fy+102,fy+77,'122,4')
dv(fy,fy+92.6,fx+134,fx+122.4,'92,6')
text(fx,fy-8,'VISTA FRONTAL',9,True)
# Right lateral view, first angle: in left position; front is to the right.
sx,sy=45,fy
c.saveState();c.translate(sx,sy)
poly([(0,9),(0,69),(5,75),(11,78),(13,88),(19,92.6),(40,92.6),(48,87),(55,75),(62,70),(65,62),(65,6),(59,0),(9,0),(3,3)])
poly([(65,3),(69.8,3),(69.8,67),(65,67)],.5)
poly([(4,70),(12,76),(17,87),(24,90),(40,90),(47,85),(54,74)],.25,False)
poly([(24,9),(24,63),(31,70),(48,70),(59,62),(62,15),(57,6),(30,5)],.3)
rect(1,15,3,46,1);rect(8,71,7,4,1);rect(17,46,6,17,1)
axis(59,35,74,35)
c.restoreState()
dh(sx,sx+69.8,sy-17,sy,'69,8')
text(sx,sy-8,'VISTA LATERAL DIREITA',9,True)
text(sx,sy-24,'Frente da câmera à direita',7)
# Top view aligned to front. Front of camera points toward top of sheet.
tx,ty=fx,59
c.saveState();c.translate(tx,ty)
poly([(0,13),(0,49),(3,58),(10,64),(23,64),(29,58),(33,50),(36,51),(36,69.8),(92,69.8),(92,51),(99,50),(104,49),(117,46),(122.4,39),(122.4,12),(117,5),(106,3),(85,3),(79,0),(49,0),(43,3),(12,3),(4,6)])
rect(36,64.8,56,5,lw=.3)
poly([(42,19),(44,49),(49,58),(78,58),(84,49),(86,19)],.3)
rect(53,7,23,17,2);rect(56,10,17,11)
line(58,11,58,20);line(71,11,71,20)
circ(18,27,11,.35);circ(18,27,9)
for a in range(0,360,30):
 t=math.radians(a);line(18+9*math.cos(t),27+9*math.sin(t),18+10.5*math.cos(t),27+10.5*math.sin(t),.18)
circ(13,52,5);circ(13,52,3.7);rect(23,41,5,10,1);rect(28,28,4,6,1)
rect(3,17,5,4,1);rect(113,17,5,4,1)
axis(64,-4,64,75)
c.restoreState()
dv(ty,ty+69.8,fx+134,fx+122.4,'69,8')
text(tx,ty-8,'VISTA SUPERIOR (DE CIMA)',9,True)
# Projection guides.
c.setStrokeColor(Color(.65,.65,.65));c.setDash([2,2])
for x in [fx,fx+122.4]:line(x,ty+72,x,fy-2,.13)
for y in [fy,fy+92.6]:line(sx+72,y,fx-3,y,.13)
c.setDash([]);c.setStrokeColor(black)
# Notes in right column.
nx=304
text(nx,246,'CRITÉRIOS DO DESENHO',9,True)
notes=[('Configuração','Corpo sem objetiva e sem correia;'),('','flash recolhido e LCD fechado.'),('Dimensões gerais','122,4 (L) × 92,6 (A) × 69,8 (P) mm.'),('','Valores aproximados do fabricante.'),('Representação','Contornos e comandos simplificados.'),('','Posições, raios, diâmetros e detalhes'),('','internos não possuem cotas de origem.'),('Uso acadêmico','Base para estudo das três vistas.'),('','Não é desenho para fabricação.'),('Projeção','Lateral direita à esquerda da frontal;'),('','vista superior abaixo da frontal.')]
yy=237
for title,body in notes:
 if title:text(nx,yy,title,8,True);yy-=5
 text(nx,yy,body,7.5);yy-=6
text(nx,135,'FONTES',9,True)
for i,s in enumerate(['Manual em português fornecido,','pp. 28-29: componentes e aparência.','Canon EOS 250D / Rebel SL3,','Supplemental Information, p. 14:','dimensões gerais do corpo.']):text(nx,128-i*5,s,7.5)
text(nx,93,'LINHAS',9,True)
line(nx,87,nx+15,87,.5);text(nx+19,86,'Contorno visível',7.5)
axis(nx,80,nx+15,80);text(nx+19,79,'Eixo de referência',7.5)
text(nx,68,'Imprimir em A3 a 100% (tamanho real).',7.5)
text(nx,63,'Não usar “ajustar à página”.',7.5)
line(10,40,410,40,.5)
for x in [210,290,345]:line(x,10,x,40)
text(15,33,'PROJETO FINAL DE DESENHO TÉCNICO',10,True)
text(15,24,'Aluno(a): __________________________________________',9)
text(15,16,'Turma: __________________  Professor(a): __________________',8)
text(215,33,'OBJETO',7);text(215,25,'Canon EOS Rebel SL3',10,True);text(215,17,'Corpo | vistas externas',8)
text(295,33,'ESCALA',7);text(295,25,'1:1',12,True);text(295,17,'Cotas em mm',8)
text(350,33,'FOLHA',7);text(350,25,'01 / 01',11,True);text(350,17,'Estudo simplificado',8)
c.showPage();c.save()
print(out.resolve())

