#!/usr/bin/env python3
"""Generate three original 300-DPI transparent Fourthwall POD graphics.

All shapes are drawn procedurally with deterministic geometry; no third-party
art, logos, branded/trademarked characters or paid assets are used.
"""
from PIL import Image, ImageDraw
from pathlib import Path
import math

SIZE = 3600
ROOT = Path(__file__).resolve().parents[1] / "assets" / "med-art"
ROOT.mkdir(parents=True, exist_ok=True)

def fresh():
    image=Image.new("RGBA",(SIZE,SIZE),(0,0,0,0))
    return image,ImageDraw.Draw(image)

def save(im,name):
    path=ROOT/name
    im.save(path,"PNG",optimize=True,dpi=(300,300))
    print(f"{path.relative_to(ROOT.parent.parent)} {path.stat().st_size} bytes")

# CONTOUR FLOW: asymmetrical mid-century-inspired line portrait abstraction.
im,d=fresh()
TEAL=(18,103,112,255); CORAL=(228,116,89,255); CREAM=(239,193,135,255)
for i in range(7):
    phase=i*0.15
    pts=[]
    for k in range(320):
        t=k/319
        x=int(550+2400*t+140*math.sin(6*math.pi*t+phase))
        y=int(670+270*i+100*math.cos(3.2*math.pi*t+i*0.55)+120*math.sin(5*math.pi*t+phase))
        pts.append((x,y))
    d.line(pts,fill=TEAL if i%3==0 else CORAL if i%3==1 else CREAM,width=35,joint="curve")
for cx,cy,r,c in [(740,710,100,CORAL),(2840,2270,100,TEAL),(1650,2840,83,CREAM)]:
    d.ellipse((cx-r,cy-r,cx+r,cy+r),fill=c)
save(im,"contour-flow.png")

# NIGHT GEOMETRY: original crisp asymmetric modern geometry.
im,d=fresh()
NAVY=(28,48,93,255); SKY=(73,154,167,255); SAND=(238,191,138,255); CLAY=(214,108,94,255)
d.pieslice((450,560,1950,2060),180,360,fill=NAVY)
d.pieslice((1720,1120,3140,2540),0,180,fill=SKY)
d.rectangle((510,1820,1510,2840),fill=CLAY)
d.ellipse((1780,2130,2720,3070),outline=NAVY,width=100)
d.ellipse((1980,2320,2540,2880),outline=SAND,width=65)
for i in range(7):
    x=1820+i*115
    d.line((x,710,x+350,980),fill=CLAY,width=35)
d.ellipse((1050,1110,1260,1320),fill=SAND)
save(im,"night-geometry.png")

# ORBIT NOTES: original connected loop motif, heavier contour for sticker edge.
im,d=fresh()
INK=(36,62,99,255); BERRY=(220,102,120,255); GOLD=(230,167,95,255)
for thickness,rad in [(88,1140),(46,790),(38,520)]:
    box=(1800-rad,1800-rad,1800+rad,1800+rad)
    d.arc(box,20,310,fill=INK if rad==1140 else BERRY if rad==790 else GOLD,width=thickness)
for a,c,r in [(44,BERRY,147),(180,GOLD,122),(302,INK,169)]:
    alpha=math.radians(a)
    x=int(1800+1140*math.cos(alpha));y=int(1800+1140*math.sin(alpha))
    d.ellipse((x-r,y-r,x+r,y+r),fill=c)
for cx,cy,size in [(850,820,94),(2710,2600,110),(890,2720,88)]:
    d.line((cx-size,cy,cx+size,cy),fill=GOLD,width=28)
    d.line((cx,cy-size,cx,cy+size),fill=GOLD,width=28)
save(im,"orbit-notes.png")
