import numpy as np
import matplotlib.pyplot as plt
import sounddevice as sd
import soundfile as sf
import scipy.fftpack
from docx import Document
from docx.shared import Inches
from io import BytesIO

data, fs = sf.read('sound1.wav', dtype='float32')
print(data.dtype)
print(data.shape)
sd.play(data, fs)
status = sd.wait()

#ZAD1
sf.write('sound_L.wav', data[:,0], fs)
sf.write('sound_R.wav', data[:,1], fs)
sf.write('sound_mix.wav', ((data[:,0] + data[:,1]) / 2), fs)

# WYKRESY ŚCIEŻEK L, R, MIX
plt.figure()
plt.subplot(3,1,1)
plt.plot(data[:,0])
plt.subplot(3,1,2)
plt.plot(data[:,1])
plt.subplot(3,1,3)
plt.plot((data[:,0] + data[:,1]) / 2)
plt.show()

# WYKRES CZASU I CZĘSTOTLIWOŚCI WIDMA
data, fs = sf.read('sin_440Hz.wav', dtype=np.int32)
plt.figure()
plt.subplot(2,1,1)
plt.plot(np.arange(0,data.shape[0])/fs,data)
plt.subplot(2,1,2)
yf = scipy.fftpack.fft(data)
plt.plot(np.arange(0,fs,1.0*fs/yf.size),np.abs(yf))
plt.show()

fsize=2**8

# MODYFIKACJA WIDMA
plt.figure()
plt.subplot(2,1,1)
plt.plot(np.arange(0,data.shape[0])/fs,data)
plt.subplot(2,1,2)
yf = scipy.fftpack.fft(data,fsize)
plt.plot(np.arange(0,fs,fs/fsize),np.abs(yf))
plt.show()

# POŁOWA WIDMA
plt.figure()
plt.subplot(2,1,1)
plt.plot(np.arange(0,data.shape[0])/fs,data)
plt.subplot(2,1,2)
yf = scipy.fftpack.fft(data,fsize)
plt.plot(np.arange(0,fs/2,fs/fsize),np.abs(yf[:fsize//2]))
plt.show()

# WIDMO W SKALI DECYBELOWEJ
plt.figure()
plt.subplot(2,1,1)
plt.plot(np.arange(0,data.shape[0])/fs,data)
plt.subplot(2,1,2)
yf = scipy.fftpack.fft(data,fsize)
plt.plot(np.arange(0,fs/2,fs/fsize),20*np.log10( np.abs(yf[:fsize//2])))
plt.show()



#ZAD2
#def plotAudio(Signal,Fs,TimeMargin=[0,0.02]):




#ZAD3
document = Document()
document.add_heading('Julian Vrtiska Sprawozdanie LAB1',0) # tworzenie nagłówków druga wartość to poziom nagłówka

files = ['sin_60Hz.wav', 'sin_440Hz.wav', 'sin_8000Hz.wav']
Margins = [[0, 0.02], [0.133, 0.155]]
for file in files:
    document.add_heading('Plik - {}'.format(file), 2)
    for i, Margin in enumerate(Margins):
        document.add_heading('Time margin {}'.format(Margin), 3)  # nagłówek sekcji, mozę być poziom wyżej
        fig, axs = plt.subplots(2, 1, figsize=(10, 7))  # tworzenie plota

        ############################################################
        # Tu wykonujesz jakieś funkcje i rysujesz wykresy
        ############################################################

        fig.suptitle('Time margin {}'.format(Margin))  # Tytuł wykresu
        fig.tight_layout(pad=1.5)  # poprawa czytelności
        memfile = BytesIO()  # tworzenie bufora
        fig.savefig(memfile)  # z zapis do bufora

        document.add_picture(memfile, width=Inches(6))  # dodanie obrazu z bufora do pliku

        memfile.close()
        ############################################################
        # Tu dodajesz dane tekstowe - wartosci, wyjscie funkcji ect.
        document.add_paragraph('wartość losowa = {}'.format(np.random.rand(1)))
        ############################################################

document.save('julian_vrtiska_sprawozdanie_lab1.docx')  # zapis do pliku