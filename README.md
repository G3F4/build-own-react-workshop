# warsawjs-workshop-45-own-react
WarsawJS Workshop 45 - Własny React

## Cel warsztatu
Zbudowanie narzędzia do renderowania aplikacji, na podstawie biblioteki React.
Podczas pracy zachowywać będziemy rzeczywistą architekturę i nazewnictwo.
Pozwoli to zrozumieć działanie oryginalnej biblioteki oraz jak tworzą oprogramowanie aktualnie największe firmy.

## Przygotowanie
Po sklonowaniu repozytorium zmienić branch na `workshop` lub `workshop-js` (jeśli preferujesz środowisko bez typów) oraz zainstalować zależności wykorzystując `yarn` lub `npm`.
Aby rozpocząć pracę, należy skorzystać ze skryptu `dev` (`yarn dev` lub `npm run dev`).
Wszystkie funkcje, które będę potrzebne do pracy, zostały napisane w postaci pustej funkcji z argumentami.
Podczas warsztatu kolejno będziemy implementować wszystkie funkcje, aż do uzyskania kodu, który potraci wyrenderować JSX w postaci drzewa DOM.
Do pracy została przygotowana prosta aplikacja. Jej kodu nie modyfikujemy.
Wszystkie funkcje do implementacji znajdują się w pliku `lib/OwnReact.[ts/js]`.

## Materiały

### Wizualizacja procesu pracy na strukturze Fiberów
![Wizualizacja procesu pracy na strukturze Fiberów](https://admin.indepth.dev/content/images/2019/08/tmp2.gif)
[źródło](https://indepth.dev/inside-fiber-in-depth-overview-of-the-new-reconciliation-algorithm-in-react/)

### Świetny artykuł na temat budowy własnego React
Z tego artykułu zapożyczony został sposób wykonania pętli i częściowo rekoncyliacji.
[Build your own React - Rodrigo Pombo](https://pomb.us/build-your-own-react/)

### Kolejny ciekawy artykuł DIY React
[Build your own React in 90 lines of JavaScript](https://dev.to/ameerthehacker/build-your-own-react-in-90-lines-of-javascript-1je2)

## Tworzenie elementu React
Rozpoczniemy od zamiany JSX na wywołania React.
Gdy `webpack`w połączeniu ze standardowym pluginem do translacji JSX na wywołania React (`@babel/plugin-transform-react-jsx`), napotka fragment kodu napisy w JSX (`<App />` albo `<div>...</div>`), zamienia ostre nawiasy na wywołanie funkcji `React.createElement`.
Właśnie dlatego w każdym pliku, który wykorzystuje JSX, musi być zaimportowany React.
Przykładowo poniższy fragment:
```jsx
<div>
    <span>test1</test>
    <button>test2</button>
</div>
```
zamieni na:
```javascript
React.createElement(
  'div',
   null,
  React.createElement('span', null, 'test1'),
  React.createElement('button', null, 'test1'),
)
```

Funkcja `React.createElement` jako argumenty dostaje:
* type — typ elementu React. Może to być nazwa elementu DOM albo funkcja komponentu.
* props - propsy elementu React użyte do renderowania
* pozostałe kolejne argumenty — dzieci elementu React

Zwraca element React. Jest to struktura danych opisująca element aplikacji. 
Każdy element React składa się z 2 podstawowych pól:
* type — typ elementu React. Może to być nazwa elementu DOM albo funkcja komponentu.
* props - propsy elementu
```typescript
interface ReactElement {
  type: Function | string; // typ elementu React, może to być funkcja, która jest komponentem albo string z nazwą elementu DOM
  props: Object; // propsy elementu React
}
```

### Zadanie
Zaimplementować funkcję `createElement`.
Jako wynik zwraca element React. Wszystkie dzieci elementu należy zamienić na tablicę i stworzyć propsa `children` i zmergować z propsami przekazanymi jako drugi argument funkcji.

### Efekt
W konsoli widzimy, że funkcja `render` dostała w argumencie poprawny element React reprezentujący wejście do aplikacji (`<App /> w pliku src/index.tsx`)

[Rozwiązanie](https://github.com/G3F4/warsawjs-workshop-45-own-react/commit/5557b63698e34314f119d7b38674797667dc35c2)

## Tworzenie Fibera i funkcja `render`
Do abstrakcji pracy do wykonania React wykorzystuje tak zwany Fiber. 
Jest to struktura opisująca pracę do wykonania na danym elemencie React.
Fiber posiada rodzaj, typ i propsy elementu React, z którym jest związany.
Każdy Fiber może posiadać powiązanie do innych Fiberów:
* rodzica
* dziecka
* rodzeństwo

Każdy Fiber posiada co najmniej jedno powiązanie.
Dzięki temu powstaje powiązana lista elementów, po której można wydajnie iterować. 

W naszej implementacji React będziemy mieć 3 rodzaje Fiberów:
* związanego z kontenerem aplikacji (`<div id="root" />`)
* związanego ze zwykłym elementem DOM (`div`, `span`, etc.)
* związanego z komponentem funkcyjnym (`App`)

```typescript
interface Fiber {
  tag: number; // typ Fibera
  stateNode: HTMLElement | null; // element DOM, z którym jest związany Fiber
  type: Function | string; // typ elementu React, z którym jest związany Fiber
  props: Object; // propsy Elementu React, z którym jest związany Fiber
  return: Fiber | null; // powiązanie do Fibera, który jest rodzicem dla tego Fibera
  sibling: Fiber | null; // powiązanie do Fibera, który jest rodzeństwem dla tego Fibera
  child: Fiber | null; // powiązanie do Fibera, który jest bezpośrednim dzieckiem dla tego Fibera
}
```

### Zadanie
Zaimplementować funkcję `createFiber` oraz `render`.

### Kroki
* Zaimplementować funkcję `createFiber`
    * dostaje na wejściu obiekt z polami:
        * `element` - element, dla którego tworzony jest Fiber
        * `tag` - rodzaj Fibera (`FunctionComponent` lub `HostRoot` lub `HostComponent`)
        * `parentFiber` - Fiber rodzica
        * `stateNode` - element DOM związany z Fiberem
    * powinna zwrócić obiekt zgodny z interfejsem.
    * pola `sibling` oraz `child` inicjalne mają wartość `null`.
    * resztę pól zainicjować odpowiednio, wykorzystując argument funkcji.
* Dodać implementację funkcji `render`
    * dostaje dwa argumenty:
        * `element` - element React wykorzystany jako wejście do aplikacji
        * `container` - element DOM wykorzystany jako kontener aplikacji
    * wewnątrz funkcji stworzyć Fiber związany z kontenerem aplikacji, a następnie ustawić go jako referencję do: 
        * `workInProgressRoot` - reprezentująca Fiber związany z kontenerem aplikacji
        * `workInProgress` - reprezentująca aktualny Fiber
    * do stworzenia Fibera wykorzystać
        * `tag` - flaga `HostRoot`
        * `stateNode` - referencja do kontenera aplikacji
        * `element` - element React bez typu, który posiada jednego propsa: `children`, który jest jednoelementową tablicą z elementem React, przekazanym w argumencie funkcji `render`.

### Efekt
Funkcja `render` po wywołaniu tworzy pierwszy Fiber, reprezentujący początek pracy do wykonania i zapisuje referencję reprezentujące Fiber związany z kontenerem aplikacji oraz aktualną jednostkę pracy do wykonania.

[Rozwiązanie](https://github.com/G3F4/warsawjs-workshop-45-own-react/commit/891aee3128e90cf79d25306c76979e5f14eea8b9)

## Pętla aplikacji
Aby nasza biblioteka działała, potrzebuje mechanizmu nieskończonej pętli, która będzie na bieżąco sprawdzała, czy jest jakaś praca do wykonania.
W najnowszych przeglądarkach dostępny jest mechanizm pozwalający wykorzystać czas bezczynności przeglądarki. 
[window.requestIdleCallback() MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback)
Wykorzystamy go, aby rozpocząć pracę nad Fiberami w momencie, gdy przeglądarka będzie bezczynna.
Funkcja przyjmuje funkcję do wykonania w pierwszym czasie bezczynności. 
Punktem wejściowym naszej aplikacji jest funkcja `performSyncWorkOnRoot` - te funkcję wykorzystamy do nieskończonej pętli aplikacji.

### Zadanie
Zaimplementować funkcję `performSyncWorkOnRoot` oraz wykorzystać `requestIdleCallback` do stworzenia pętli aplikacji.

#### Kroki
* wywołać `requestIdleCallback` i przekazać `performSyncWorkOnRoot`
* dodać ciało funkcji `performSyncWorkOnRoot`
    * dodać `if`, który sprawdza, czy jest jakaś praca do wykonania (`workInProgress`)
        * jeśli jest jakaś praca rozpocząć pętlę `while`, która będzie pracować tak długo aż jest jakaś praca do wykonania
            * wewnątrz pętli `while` wywołujemy funkcję `performUnitOfWork` i przekazujemy jej `workInProgress`
            * wynik zapisujemy do `workInProgress`
            
### Efekt
W konsoli widzimy, że wykonała się funkcja `performUnitOfWork`, po czym nieskończona pętla się zatrzymała, ponieważ `performUnitOfWork` na razie zwraca `null`.

[Rozwiązanie](https://github.com/G3F4/warsawjs-workshop-45-own-react/commit/b3eda4c2a784816ff55aa782291a17e530e6ed6b)

## Rozpoczęcie pracy na Fiberze
Teraz zajmiemy się rozpoczęciem wykonania pracy.
Funkcja `beginWork` jest odpowiedzialna za przygotowanie Fibera do procesu rekoncyliacji.
Dla komponentów niefunkcyjnych wystarczy po prostu przekazać do funkcji `reconcileChildren` dzieci, czyli props `children` Fibera.
Jednak dla komponentów funkcyjnych należy wywołać odpowiednio ten komponent, aby uzyskać jego dzieci.
Na koniec funkcja powinna zwrócić wartość pola `child`.
W procesie rekoncyliacji, jeśli Fiber posiada jakieś dzieci, wartość pola `child` zostanie zainicjowana.
Tym zajmiemy się w kolejnym zadaniu.

### Zadanie
Zaimplementować funkcję `beginWork` i rozpocząć wykonywanie pracy w funkcji `performUnitOfWork`.

#### Kroki
* W funkcji `performUnitOfWork`
    * stworzyć zmienną (`let`) o nazwie `next` i zainicjować jej wartość wywołaniem funkcji `beginWork`
    * zwrócić zmienną `next`
* W funkcji `reconcileChildren` dodać zwracanie `null` - implementacją zajmiemy się w następnym zadaniu
* Implementacja funkcji `beginWork`
    * funkcja jako argument (`unitOfWork`) dostaje Fiber 
    * wewnątrz funkcji w zależności od wartości pola `tag` wywołujemy odpowiednio funkcję `reconcileChildren`
        * jako pierwszy argument przekazujemy Fiber dostępny w domknięciu funkcji `beginWork`.
        * jako drugi przekazujemy tablicę elementów, które są dziećmi.
            * dla komponentów funkcyjnych (`FunctionComponent`) musimy wywołać komponent funkcyjny, który znajduje się pod polem `type` Fibera przekazanego do funkcji `beginWork`
                * funkcja komponentu zwraca element React.
                * do funkcji komponentu przekazujemy propsy znajdujące się w polu `props` Fibera przekazanego do funkcji `beginWork`
            * dla komponentów związanych z kontenerem aplikacji lub elementem DOM (`HostRoot` lub `HostComponent`)
    * na koniec zwracamy dziecko, które znajduje się w polu `child` Fibera przekazanego do funkcji `beginWork`

#### Efekt
Brak różnic z poprzednim etapem. W konsoli widzimy tylko, że wywołana została funkcja `reconcileChildren`.

[Rozwiązanie](https://github.com/G3F4/warsawjs-workshop-45-own-react/commit/730ebdba2ee17803e63ab8edc3af20c3d67ee103)

## Rekoncyliacja (Reconciliation)
Teraz zajmiemy się kluczowym mechanizmem, czyli procesem rekoncyliacji.
Proces ten polega na ustaleniu zależności między elementami.
Dla każdego Fibera, który posiada jakieś dzieci, zostaną utworzone nowe Fibery i zapisane odpowiednie powiązania.
Pierwszym powiązaniem jest `child` reprezentujący pierwsze dziecko.
Drugim jest `sibling` reprezentującym sąsiedni Fiber — rodzeństwo.
Ostatnim jest `return` reprezentującym rodzica Fibera.
Słowo `return` odnosi się do tego, w jaki sposób będziemy się poruszać po stworzonej sieci zależności.

### Zadanie
Zaimplementować funkcję `reconcileChildren`

#### Kroki
* Stworzyć `if`, który będzie sprawdzał, czy argument `children` jest tablicą bądź obiektem
    * jeśli nie jest — ustawić wartość pola Fibera `child` na `null`
    * jeśli jest:
        * stworzyć zmienną (`let`), która będzie przechowywać referencję do ostatnio iterowanego elementu
            * zainicjować wartością `null`
        * stworzyć stałą (`const`) na tablicę elementów
            * w zależności od tego, czy argument `children` jest tablicą czy obiektem, inaczej inicjujemy wartość stałej
                * jeśli argument `chidlren` jest obiektem, tworzymy z niego jednoelementową tablicę i przypisujemy do stałej
                * jeśli jest tablicą, przypisujemy wartość tablicy do stałej.
        * po stworzeniu tablicy elementów iterujemy po niej.
            * dla każdego elementu musimy stworzyć Fiber, wykorzystując wcześniej napisaną funkcję `createFiber`.
                * do tego potrzebujemy wyliczyć wartość pola `tag` dla nowo tworzonego Fibera
                    * w zależności od tego, czy typem pola `type` jest funkcja czy nie możemy w prosty sposób ustalić, czy mamy do czynienia z komponentem funkcyjnym, czy związanym z elementem DOM (`FunctionalComponent` lub `HostComponent`).
                        * użyj `typeof`.
                * jako `parentFiber` dajemy Fiber dostępny w domknięciu funkcji
                * jako `element` element, który jest iterowany
            * po stworzeniu nowego Fibera w zależności od tego, czy iterujemy pierwszy element, czy nie:
                * dla pierwszego iterowanego elementu zapisujemy referencję do nowego Fibera w polu `child` Fibera dostępnego w domknięciu funkcji
                * dla każdego kolejnego iterowanego elementu zapisujemy referencję do nowego Fibera w polu `sibling` poprzednio iterowanego Fibera
            * na koniec zapisujemy referencję do stworzonego Fibera w zmiennej przechowującej referencję do ostatnio stworzonego Fibera.

#### Efekt
Utworzone zostają Fibery dla wszystkich elementów z odpowiednim powiązaniem.

[Rozwiązanie](https://github.com/G3F4/warsawjs-workshop-45-own-react/commit/a9a42134ee8ae1015e13d313e5f4c202dc188395)

## Kończenie pracy na Fiberze
Następnie zajmiemy się zakończeniem pracy na Fiberze.
W procesie tym dla Fiberów związanych z elementem DOM zostaną utworzone te elementy.

### Zadanie
Zaimplementować funkcję `completeUnitOfWork` i wykorzystać w funkcji `performUnitOfWork`

#### Kroki
* W funkcji `performUnitOfWork` po wywołaniu `beginWork` jeśli wartość, na którą wskazuje zmienna `next` to `null` wywołać funkcję `completeUnitOfWork`.
    * Wynik wywołania zapisać w zmiennej `next`
* Dodać implementację funkcji `completeUnitOfWork`
    * argument `unitOfWork` funkcji to Fiber
    * na początek funkcja ustawia aktualnie wykonywaną jednostkę pracy (`unitOfWork`) w globalnej zmiennej `workInProgress`.
    * następnie tworzymy pętlę `do { ... } while ()`, która pracuje tak długa aż `workInProgress` jest różne od `null`
    * wewnątrz pętli:
        * sprawdzamy, czy aktualnie ustawiona jednostka pracy `workInProgress` jest Fiberem typu `HostComponent`
            * jeśli jest tworzymy element DOM wykorzystując `document.createElement` i jako argument przekazując wartość pola `type`
        * następnie sprawdzamy, czy aktualnie ustawiona jednostka pracy `workInProgress` posiada jakieś rodzeństwo (pole `sibling`).
            * jeśli posiada — przerywamy pętlę i zwracamy rodzeństwo, które stanie się następną aktualną jednostką pracy.
            
#### Efekt
Odpowiednie Fibery posiadają zapisaną referencję do stworzonych elementów DOM.

[Rozwiązanie](https://github.com/G3F4/warsawjs-workshop-45-own-react/commit/1db1fc6fb7af22d171f0a50e631aea691071653c)

## Dokonywanie wyników pracy
Po zakończeniu pracy musimy pokazać jej wyniki.
W tym celu przejdziemy po wcześniej stworzonej strukturze i dodamy elementy DOM do kontenera aplikacji aby zostały wyrenderowane przez przeglądarkę.
Dzięki wcześniej stworzonym powiązaniom, rekurencyjne przejście po wszystkich węzłach w odpowiedniej kolejności będzie proste.

### Zadanie
Zaimplementować funkcję `commitWork` i wykorzystać w funkcji `performSyncWorkOnRoot` do rozpoczęcia procesu dodawania elementów DOM do kontenera aplikacji.

#### Kroki
* W funkcji `performSyncWorkOnRoot` jeśli pętle `while` zakończy pracę, wywołujemy funkcję `commitWork`
    * jako argument przekazujemy dziecko Fibera związanego z kontenerem aplikacji (`workInProgressRoot`).
* Dodanie implementacji funkcji `commitWork`
    * jako argument dostaje Fiber
    * na początek sprawdzamy, czy przekazany Fiber posiada w polu `stateNode` referencję do elementu DOM
        * jeśli posiada — szukamy najbliższego rodzica związanego z elementem DOM.
            * tworzymy zmienną przechowującą referencję do rodzica i inicjujemy ją referencją rodzica Fibera przekazanego do funkcji.
            * następnie wykorzystujemy referencję do rodzica zapisaną w polu `return`.
                * sprawdzamy, czy rodzic posiada referencję do elementu DOM w polu `stateNode`
                    * jeśli nie posiada, zapisujemy referencję do rodzica rodzica i powtarzamy proces, aż znajdziemy Fiber z elementem DOM.
        * po znalezieniu rodzica z elementem DOM wykorzystujemy metodę elementu DOM `appendChild`.
            * jako argument przekazujemy element DOM związany z Fiberem, który jest argumentem funkcji.
    * na koniec sprawdzamy, czy Fiber, który jest argumentem funkcji, ma dziecko lub rodzeństwo.
        * jeśli ma dziecko — wykonujemy dla dziecka zagłębienie rekurencyjne, przekazując do funkcji `commitWork` dziecko (pole `child`).
        * jeśli ma rodzeństwo — wykonujemy dla rodzeństwa zagłębienie rekurencyjne, przekazując do funkcji `commitWork` rodzeństwo (pole `sibling`).
        

#### Efekt
Struktura DOM widoczna.

[Rozwiązanie](https://github.com/G3F4/warsawjs-workshop-45-own-react/commit/122a5746281b7262a649c9defd42d17f3d559738)

## Aktualizacja właściwości elementu DOM
Ostanim zadaniem jest aktualizacja właściwości elementów DOM.
Elementy powinny wyświetlać tekst, nadawać style inline oraz dodawać nasłuchiwanie na zdarzenia.

### Zadanie
Zaimplementować funkcję `updateProperties` i wykorzystać w funkcji `commitWork`

#### Kroki
* Wywołać `updateProperties` w funkcji `commitWork`
    * jako argument przekazać Fiber z domknięcia funkcji `commitWork`
* Dodać implementację funkcji `updateProperties`
    * jako argument dostaje Fiber
    * napisać funkcję pomocniczą sprawdzającą, czy dany prop jest zdarzeniem.
        * funkcja jako argument powinna przyjmować nazwę propa i sprawdzać, czy zaczyna się on znakami `on`.
    * napisać funkcję pomocniczą sprawdzającą, czy dany prop jest obiektem styli.
        * funkcja jako argument powinna przyjmować nazwę propa i sprawdzać, czy równa się `style`.
    * napisać funkcję pomocniczą sprawdzającą, czy dany prop jest tekstem.
        * funkcja jako argument powinna przyjmować wartość propa i sprawdzać, czy jest on łańcuchem znaków lub liczbą.
    * wewnątrz funkcji rozpocząć iterowanie po polach obiektu propsów dostępnego w polu `props`
        * Wykorzystać `Object.keys` lub `Object.entries`
        * podczas iteracji po propsach wykorzystujemy wcześniej napisane funkcje pomocnicze do sprawdzania iterowany prop.
            * jeśli to tekst — ustawiamy wartość pola `textContent` w elemencie DOM związanym z Fiberem (pole `stateNode`).
            * jeśli to zdarzenie:   
                * nazwę propa zamieniamy na małe litery i usuwamy 2 pierwsze, aby uzyskać nazwę zdarzenia.
                * wykorzystując metodę elementu DOM `addEventListener` dodajemy na elemencie nasłuchiwanie na zdarzenie
                    * jako pierwszy argument przekazujemy nazwę zdarzenia.
                    * jako drugi wartość iterowanego propa.
            * jeśli to obiekt styli
                * iteruj się do wszystkich elementach obiektu styli
                    * dla każdego stylu zaktualizuj wartość pola `style` elementu DOM
                        ```typescript
                        Object.entries(prop).forEach(([cssProperty, value]) => {
                            fiber.stateNode.style[cssProperty] = value;
                        });
                        ```
        
#### Efekt
Wyrenderowana aplikacja, która reaguje na kliknięcia w przyciski (logi w konsoli).

[Rozwiązanie](https://github.com/G3F4/warsawjs-workshop-45-own-react/commit/dedcfc95f792229aec1ff64412e872774aed1b52)
