"use client";

import { useState } from "react";
import jsPDF from "jspdf";

/**
 * EPKDownload — generates a professional EPK PDF entirely client-side using
 * jsPDF's native drawing APIs (no html2canvas, no server-side rendering).
 *
 * This avoids the html2canvas + Tailwind 4 oklch/lab incompatibility.
 * The PDF is constructed programmatically with text, images, and shapes.
 *
 * Works on ANY hosting (Vercel, Netlify, etc.) — cost-0, reliable.
 */
export function EPKDownload() {
  const [generating, setGenerating] = useState(false);

  async function handleDownload() {
    setGenerating(true);
    try {
      // Fetch the artist image as base64
      const imgResponse = await fetch("/assets/images/bio.jpg");
      const imgBlob = await imgResponse.blob();
      const imgBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(imgBlob);
      });

      // Create PDF — A4 portrait (210 x 297 mm)
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      // === BACKGROUND ===
      pdf.setFillColor(10, 10, 10); // #0a0a0a
      pdf.rect(0, 0, 210, 297, "F");

      // === HEADER BAR (gold border) ===
      pdf.setDrawColor(212, 175, 55); // #d4af37
      pdf.setLineWidth(0.3);
      pdf.line(15, 30, 195, 30); // top gold line

      // Artist photo (30x40mm, top-left)
      try {
        pdf.addImage(imgBase64, "JPEG", 15, 8, 30, 20);
      } catch {}

      // Title "ARAGAL"
      pdf.setTextColor(212, 175, 55); // gold
      pdf.setFontSize(36);
      pdf.setFont("helvetica", "bold");
      pdf.text("ARAGAL", 55, 18);

      // Tagline
      pdf.setTextColor(160, 160, 160);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "normal");
      pdf.text("MARIO ARAVENA  ·  COMPOSITOR & PRODUCTOR MUSICAL", 55, 23);

      // EPK label
      pdf.setDrawColor(212, 175, 55);
      pdf.setLineWidth(0.2);
      pdf.roundedRect(55, 25, 35, 4, 0.5, 0.5, "S");
      pdf.setFontSize(5);
      pdf.setTextColor(212, 175, 55);
      pdf.text("ELECTRONIC PRESS KIT", 57, 28);

      // === STATS BAR ===
      pdf.setDrawColor(212, 175, 55);
      pdf.setLineWidth(0.2);
      pdf.line(15, 42, 195, 42);
      pdf.line(15, 52, 195, 52);

      const stats = [
        { num: "24+", lbl: "AÑOS EN SCD" },
        { num: "100+", lbl: "CANCIONES" },
        { num: "6", lbl: "PAÍSES" },
      ];
      stats.forEach((s, i) => {
        const x = 40 + i * 50;
        pdf.setTextColor(212, 175, 55);
        pdf.setFontSize(18);
        pdf.setFont("helvetica", "bolditalic");
        pdf.text(s.num, x, 49);
        pdf.setTextColor(136, 136, 136);
        pdf.setFontSize(5);
        pdf.setFont("helvetica", "normal");
        pdf.text(s.lbl, x, 51.5);
      });

      // === BIO ===
      pdf.setTextColor(212, 175, 55);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "bold");
      pdf.text("BIOGRAFÍA", 15, 60);
      pdf.setLineWidth(0.15);
      pdf.line(15, 61, 195, 61);

      pdf.setTextColor(192, 184, 168);
      pdf.setFontSize(7.5);
      pdf.setFont("helvetica", "normal");
      const bio1 = "Hay compositor que escribe canciones. Y hay compositor que escribe la vida de quienes las cantan. Mario Aravena pertenece a esa segunda estirpe: la del autor que pone palabras a lo que muchos sienten y no saben decir —la fe, el barrio, la memoria, el amor— y lo hace con el sonido del son cubano, la salsa y la canción espiritual.";
      const bio2 = "Desde los años ochenta, su oficio ha atravesado géneros y fronteras. En 2024 lanzó el EP «Con sabor Cubano» junto a Jesús «Aguaje» Ramos, director musical de Buena Vista Social Club. Sus canciones han viajado a España, EEUU, México, Cuba y Centroamérica.";
      const bioLines1 = pdf.splitTextToSize(bio1, 180);
      const bioLines2 = pdf.splitTextToSize(bio2, 180);
      pdf.text(bioLines1, 15, 66);
      pdf.text(bioLines2, 15, 66 + bioLines1.length * 4);

      const bioEndY = 66 + (bioLines1.length + bioLines2.length) * 4 + 4;

      // === TWO COLUMNS ===
      // Left: Collaborations
      pdf.setTextColor(212, 175, 55);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "bold");
      pdf.text("COLABORACIONES", 15, bioEndY);
      pdf.setLineWidth(0.15);
      pdf.line(15, bioEndY + 1, 95, bioEndY + 1);

      const collabs = [
        { name: "Jesús Aguaje Ramos", role: "Director BVSC" },
        { name: "Alexis Venegas", role: "Cantautor chileno" },
        { name: "Aldo Miranda", role: "Voz destacada" },
        { name: "Magdalena Matthey", role: "Cantautora" },
        { name: "Carlos Araneda", role: "Vocalista" },
      ];
      pdf.setFontSize(7);
      collabs.forEach((c, i) => {
        const y = bioEndY + 6 + i * 5;
        pdf.setTextColor(212, 175, 55);
        pdf.setFont("helvetica", "bold");
        pdf.text("—", 15, y);
        pdf.text(c.name, 18, y);
        pdf.setTextColor(170, 170, 170);
        pdf.setFont("helvetica", "normal");
        pdf.text(c.role, 18 + pdf.getTextWidth(c.name) + 2, y);
      });

      // Right: Discography
      const col2X = 110;
      pdf.setTextColor(212, 175, 55);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "bold");
      pdf.text("DISCOGRAFÍA", col2X, bioEndY);
      pdf.setLineWidth(0.15);
      pdf.line(col2X, bioEndY + 1, 195, bioEndY + 1);

      const tracks = [
        { name: "OLIVIA", cat: "Son Cubano" },
        { name: "TU Y YO", cat: "Salsa" },
        { name: "MADRE, PARA TI", cat: "Espiritual" },
        { name: "COMO HA PASADO EL TIEMPO", cat: "Tradicional" },
      ];
      pdf.setFontSize(7);
      tracks.forEach((t, i) => {
        const y = bioEndY + 6 + i * 5;
        pdf.setTextColor(212, 175, 55);
        pdf.setFont("helvetica", "bold");
        pdf.text("—", col2X, y);
        pdf.text(t.name, col2X + 3, y);
        pdf.setTextColor(119, 119, 119);
        pdf.setFont("helvetica", "normal");
        pdf.text(t.cat, col2X + 3 + pdf.getTextWidth(t.name) + 2, y);
      });

      const colsEndY = bioEndY + 6 + Math.max(collabs.length, tracks.length) * 5 + 4;

      // === RECOGNITIONS ===
      pdf.setTextColor(212, 175, 55);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "bold");
      pdf.text("RECONOCIMIENTOS", 15, colsEndY);
      pdf.setLineWidth(0.15);
      pdf.line(15, colsEndY + 1, 195, colsEndY + 1);

      // Quote 1
      pdf.setFillColor(212, 175, 55);
      pdf.rect(15, colsEndY + 4, 0.5, 10, "F"); // gold left border
      pdf.setFillColor(20, 18, 12);
      pdf.rect(15.5, colsEndY + 4, 179.5, 10, "F");
      pdf.setTextColor(200, 192, 176);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "italic");
      const quote1 = "Director musical de la mítica orquesta Buena Vista Social Club colabora en el EP Con sabor Cubano (2024).";
      const quoteLines = pdf.splitTextToSize(quote1, 175);
      pdf.text(quoteLines, 18, colsEndY + 8);
      pdf.setTextColor(212, 175, 55);
      pdf.setFontSize(6);
      pdf.setFont("helvetica", "normal");
      pdf.text("— Buena Vista Social Club, 2024", 18, colsEndY + 8 + quoteLines.length * 3.5);

      // === CONTACT ===
      const contactY = colsEndY + 20;
      pdf.setFillColor(30, 26, 14);
      pdf.roundedRect(15, contactY, 180, 16, 1, 1, "F");
      pdf.setDrawColor(212, 175, 55);
      pdf.setLineWidth(0.15);
      pdf.roundedRect(15, contactY, 180, 16, 1, 1, "S");

      pdf.setTextColor(212, 175, 55);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "bold");
      pdf.text("CONTACTO & STREAMING", 18, contactY + 4);

      pdf.setTextColor(232, 224, 208);
      pdf.setFontSize(7.5);
      pdf.setFont("helvetica", "normal");
      pdf.text("Booking: mharavena@yahoo.es", 18, contactY + 9);

      pdf.setTextColor(212, 175, 55);
      pdf.setFontSize(6);
      const platforms = ["Spotify", "YouTube", "Instagram", "Apple Music", "Amazon Music", "Facebook"];
      let xPos = 18;
      platforms.forEach((p) => {
        pdf.text(p, xPos, contactY + 13);
        xPos += pdf.getTextWidth(p) + 5;
      });

      // === FOOTER ===
      pdf.setDrawColor(34, 34, 34);
      pdf.setLineWidth(0.1);
      pdf.line(15, 285, 195, 285);
      pdf.setTextColor(68, 68, 68);
      pdf.setFontSize(5.5);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        `© ${new Date().getFullYear()} ARAGAL — Mario Aravena · Electronic Press Kit · aragal.vercel.app`,
        105,
        288,
        { align: "center" }
      );

      // Save
      pdf.save("EPK-ARAGAL-Mario-Aravena.pdf");
    } catch (err) {
      console.error("EPK generation failed:", err);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={generating}
      className="btn-gold focus-gold"
    >
      {generating ? "Generando PDF..." : "📄 Descargar EPK (PDF)"}
    </button>
  );
}
