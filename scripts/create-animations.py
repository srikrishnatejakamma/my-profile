"""Generate original, self-contained animated artwork for the portfolio."""
from pathlib import Path
from math import sin, cos, pi
from PIL import Image, ImageDraw, ImageFilter

OUTPUT = Path(__file__).resolve().parents[1] / 'assets' / 'images'
OUTPUT.mkdir(parents=True, exist_ok=True)
PALETTE = Image.new('P', (1, 1))
PALETTE.putpalette([channel for n in range(256) for channel in (int(11 + n * .59), int(14 + n * .83), int(17 + n * .70))])

def save_animation(frames, name, background):
    frames[0].save(OUTPUT / f'{name}.png', optimize=True)
    palette = frames[0].quantize(colors=128)
    indexed = [frame.quantize(palette=palette, dither=Image.Dither.NONE) for frame in frames]
    indexed[0].save(OUTPUT / f'{name}.gif', save_all=True, append_images=indexed[1:], duration=80, loop=0, optimize=True, disposal=1)

def sphere():
    size, center, radius = 600, 300, 205
    frames = []
    def project(latitude, longitude, phase):
        x, y, z = cos(latitude) * cos(longitude + phase), sin(latitude), cos(latitude) * sin(longitude + phase)
        tilt = .30
        y, z = y*cos(tilt)-z*sin(tilt), y*sin(tilt)+z*cos(tilt)
        x, y = x*cos(-.24)-y*sin(-.24), x*sin(-.24)+y*cos(-.24)
        return center + x*radius, center + y*radius, z
    for step in range(48):
        phase = step/48*2*pi/24
        image = Image.new('RGB', (size, size), (11, 14, 17))
        lines = Image.new('RGB', (size, size), (0, 0, 0)); draw = ImageDraw.Draw(lines)
        for latitude in [(-pi/2 + j*pi/18) for j in range(1,18)]:
            previous = None
            for n in range(241):
                point = project(latitude, n/240*2*pi, phase)
                if previous:
                    brightness = int(40 + (point[2]+1)*61)
                    draw.line([previous[:2], point[:2]], fill=(int(brightness*.62),brightness,int(brightness*.83)), width=1)
                previous = point
        for longitude in [j/24*2*pi for j in range(24)]:
            previous = None
            for n in range(121):
                point = project(-pi/2+n/120*pi,longitude,phase)
                if previous:
                    brightness = int(32+(point[2]+1)*55)
                    draw.line([previous[:2],point[:2]],fill=(int(brightness*.62),brightness,int(brightness*.83)),width=1)
                previous = point
        from PIL import ImageChops
        image = ImageChops.add(image, lines.filter(ImageFilter.GaussianBlur(6)).point(lambda x:int(x*.23)))
        image = ImageChops.add(image, lines)
        draw = ImageDraw.Draw(image)
        for node in range(7):
            latitude = -.75+node*.24
            longitude = node*1.17
            x,y,z = project(latitude,longitude-phase,phase)
            if z > -.25:
                r = 2.5
                draw.ellipse((x-r,y-r,x+r,y+r),fill=(174,240,211))
        draw.ellipse((center-radius-18,center-radius-18,center+radius+18,center+radius+18),outline=(34,51,47))
        frames.append(image)
    save_animation(frames, 'system-orbit', (11,14,17))

def network():
    frames=[]
    nodes=[(95,90),(95,155),(95,220),(218,65),(218,125),(218,185),(218,245),(345,90),(345,155),(345,220),(468,125),(468,185)]
    edges=[(i,j) for start,end,next_start,next_end in [(0,3,3,7),(3,7,7,10),(7,10,10,12)] for i in range(start,end) for j in range(next_start,next_end)]
    for step in range(40):
        image=Image.new('RGB',(560,310),(16,27,29));draw=ImageDraw.Draw(image)
        for x in range(0,560,28):
            for y in range(0,310,28):draw.point((x,y),fill=(30,45,46))
        for i,j in edges:
            a,b=nodes[i],nodes[j];draw.line([a,b],fill=(37,67,59),width=1)
            offset=(step/40+(i*.17+j*.11))%1
            x=a[0]+(b[0]-a[0])*offset;y=a[1]+(b[1]-a[1])*offset
            draw.ellipse((x-1.5,y-1.5,x+1.5,y+1.5),fill=(112,175,150))
        for n,(x,y) in enumerate(nodes):
            r=5+sin(step/40*2*pi+n*.5)*1.2
            draw.ellipse((x-12,y-12,x+12,y+12),outline=(42,74,63))
            draw.ellipse((x-r,y-r,x+r,y+r),fill=(154,210,185))
        frames.append(image)
    save_animation(frames,'neural-flow',(16,27,29))

if __name__ == '__main__':
    sphere();network()
    for path in OUTPUT.glob('*.gif'):print(f'{path.name}: {path.stat().st_size//1024} KB')
