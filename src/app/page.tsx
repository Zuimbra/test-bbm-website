import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FirstBorn from "@/components/FirstBorn";
import IntroScreen from "@/components/IntroScreen";
import BagSuccessPopup from "@/components/BagSuccessPopup";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#111111] text-white">

      {/* INTRO SCREEN */}
      <IntroScreen />
      
      {/* CABEÇALHO FIXO E DINÂMICO */}
      <Header />

      {/* POPUP DE SUCESSO */}
      <BagSuccessPopup />

      {/* HERO COM FOTO E SLOGAN */}
      <Hero />

      {/* COLEÇÃO FIRST BORN */}
      <FirstBorn />

      {/* SOBRE A MARCA */}
      <section
        id="about"
        className="border-t border-neutral-800 px-6 py-20 md:px-12"
      >
        <p className="mb-4 text-xs uppercase tracking-widest text-neutral-500">
          002 / Our Story
        </p>

        <h2 className="text-4xl font-black uppercase tracking-tighter">
          Built Different
        </h2>

        {/* TEXTO INSERIDO AQUI */}
        <div className="mt-8 max-w-2xl space-y-4 text-neutral-300 md:text-lg">
          <p>
            A Built by Miles nasceu de uma vontade simples: criar algo ao qual valesse a pena pertencer. Um projeto pessoal de Dario Soares, que começa na corrida e encontra sentido no caminho.
          </p>
          <p>
            O caminho nos constrói. O movimento nos transforma. A intenção nos guia.
          </p>
          <p>
            As experiências, o esforço e a constância fazem parte de quem somos. O movimento vai além da corrida. Não é preciso ser atleta para fazer parte.
          </p>
        </div>
      </section>

      {/* RODAPÉ */}
        <footer className="px-6 pb-6 pt-2 text-right md:px-12">
        <p className="text-[9px] font-normal tracking-[0.05em] text-neutral-600">
          Site desenhado e desenvolvido por Mateus Braga
        </p>
      </footer>


    </main>
  );
}