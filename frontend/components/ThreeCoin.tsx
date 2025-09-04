"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "@/node_modules/@types/three";

export default function ThreeCoin({ size = 140 }: { size?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 3;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(size, size);
    el.appendChild(renderer.domElement);

    const geo = new THREE.CylinderGeometry(1, 1, 0.08, 64);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.1,
    });
    const coin = new THREE.Mesh(geo, mat);
    coin.rotation.x = Math.PI / 2;
    scene.add(coin);
    const light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(3, 3, 3);
    scene.add(light);
    const amb = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(amb);

    let raf = 0;
    const loop = () => {
      coin.rotation.z += 0.02;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, [size]);
  return <div ref={ref} style={{ width: size, height: size }} />;
}
