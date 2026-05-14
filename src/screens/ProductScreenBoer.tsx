import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ImageBackground,
  SafeAreaView
} from 'react-native'; 
import { Product } from '../models/Product';
import { productService } from '../services/products_service';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function ProductScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [preco, setPreco] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<any>({});

  const validate = () => {
    let newErrors: any = {};

    if (!nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!categoria.trim()) newErrors.categoria = 'Categoria é obrigatória';

    if (!preco.trim()) {
      newErrors.preco = 'Preço é obrigatório';
    } else if (isNaN(Number(preco))) {
      newErrors.preco = 'Preço deve ser numérico';
    } else if (Number(preco) <= 0) {
      newErrors.preco = 'Preço deve ser maior que zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const loadProducts = async () => {
    const data = await productService.getAll();
    setProducts(data);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSave = async () => {
    if (!validate()) return;

    const product: Product = {
      nome,
      descricao,
      categoria,
      preco: parseFloat(preco)
    };

    if (editingId) {
      await productService.update(editingId, product);
      setEditingId(null);
    } else {
      await productService.create(product);
    }

    clearFields();
    loadProducts();
  };

  //carrega os dados gravados nos textinputs para serem alterados
  const handleEdit = (product: Product) => {
    setNome(product.nome);
    setDescricao(product.descricao);
    setCategoria(product.categoria);
    setPreco(product.preco.toString());
    setEditingId(product.id || null);
  };

  const handleDelete = async (id: string) => {
    await productService.delete(id);
    loadProducts();
  };

  const clearFields = () => {
    setNome('');
    setDescricao('');
    setCategoria('');
    setPreco('');
    setErrors({});
  };

return (
  <SafeAreaProvider>
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground
        source={require("../../assets/images/background.png")}
        style={estilos.container}
        resizeMode="stretch"
      >
        <Text style={estilos.titulo}>Produtos</Text>

        {/* FORMULÁRIO */}
        <TextInput
          placeholder="Nome"
          value={nome}
          onChangeText={setNome}
          style={estilos.input}
        />
        {errors.nome && <Text style={{ color: "red" }}>{errors.nome}</Text>}

        <TextInput
          placeholder="Descrição"
          value={descricao}
          onChangeText={setDescricao}
          style={estilos.input}
        />

        <TextInput
          placeholder="Categoria"
          value={categoria}
          onChangeText={setCategoria}
          style={estilos.input}
        />
        {errors.categoria && (
          <Text style={{ color: "red" }}>{errors.categoria}</Text>
        )}

        <TextInput
          placeholder="Preço"
          value={preco}
          onChangeText={setPreco}
          keyboardType="numeric"
          style={estilos.input}
        />
        {errors.preco && (
          <Text style={{ color: "red" }}>{errors.preco}</Text>
        )}

        {/* BOTÃO SALVAR */}
        <TouchableOpacity style={estilos.botao} onPress={handleSave}>
          <Text style={estilos.textoBotao}>
            {editingId ? "Atualizar" : "Salvar"}
          </Text>
        </TouchableOpacity>

        {/* LISTA */}
        <FlatList
          data={products}
          keyExtractor={(item) => item.id!}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View style={estilos.card}>
              <Text style={estilos.nome}>{item.nome}</Text>
              <Text style={estilos.desc}>{item.descricao}</Text>
              <Text style={estilos.desc}>{item.categoria}</Text>
              <Text style={estilos.preco}>R$ {item.preco}</Text>

              <TouchableOpacity
                style={estilos.botao}
                onPress={() => handleEdit(item)}
              >
                <Text style={estilos.textoBotao}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={estilos.botaoDelete}
                onPress={() => handleDelete(item.id!)}
              >
                <Text style={estilos.textoDelete}>Excluir</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </ImageBackground>
    </SafeAreaView>
  </SafeAreaProvider>
);

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  
  botao: {
    backgroundColor: "#198d62",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20
  },

  textoBotao: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "bold"
  },

  message: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },

  card: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#000",
    marginBottom: 15,
  },

  nome: {
    fontSize: 20,
    fontWeight: "bold",
  },

  preco: {
    fontSize: 18,
    marginTop: 5,
  },

  desc: {
    marginTop: 5,
    fontSize: 16,
  },

  botaoDelete: {
    marginTop: 10,
    backgroundColor: "#ff4444",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  textoDelete: {
    color: "#fff",
    fontWeight: "bold",
  },
});
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Cadastro de Produtos</Text>

//       <View style={styles.form}> 
//         <TextInput
//           placeholder="Nome"
//           value={nome}
//           onChangeText={setNome}
//           style={styles.input}
//         />
//         {errors.nome && <Text style={styles.error}>{errors.nome}</Text>}

//         <TextInput
//           placeholder="Descricao"
//           value={descricao}
//           onChangeText={setDescricao}
//           style={styles.input}
//         />
//         {errors.descricao && <Text style={styles.error}>{errors.descricao}</Text>}

//         <TextInput
//           placeholder="Categoria"
//           value={categoria}
//           onChangeText={setCategoria}
//           style={styles.input}
//         />
//         {errors.categoria && <Text style={styles.error}>{errors.categoria}</Text>}

//         <TextInput
//           placeholder="Preço"
//           value={preco}
//           onChangeText={setPreco}
//           keyboardType="numeric"
//           style={styles.input}
//         />
//         {errors.preco && <Text style={styles.error}>{errors.preco}</Text>}

//         <TouchableOpacity style={styles.button} onPress={handleSave}>
//           <Text style={styles.buttonText}>
//             {editingId ? 'Atualizar' : 'Salvar'}
//           </Text>
//         </TouchableOpacity>
//       </View>

//       <FlatList
//         data={products}
//         keyExtractor={(item) => item.id!}
//         renderItem={({ item }) => (
//           <View style={styles.card}>
//             <Text style={styles.cardTitle}>{item.nome}</Text>
//             <Text style={styles.cardText}>Marca: {item.descricao}</Text>
//             <Text style={styles.cardText}>Categoria: {item.categoria}</Text>
//             <Text style={styles.price}>R$ {item.preco}</Text>

//             <View style={styles.actions}>
//               <TouchableOpacity
//                 style={[styles.actionBtn, styles.editBtn]}
//                 onPress={() => handleEdit(item)}
//               >
//                 <Text style={styles.actionText}>Editar</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[styles.actionBtn, styles.deleteBtn]}
//                 onPress={() => handleDelete(item.id!)}
//               >
//                 <Text style={styles.actionText}>Excluir</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#F4F6F8'
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 15,
//     color: '#333'
//   },
//   form: {
//     backgroundColor: '#FFF',
//     padding: 15,
//     borderRadius: 10,
//     marginBottom: 20,
//     elevation: 3
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#DDD',
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 10
//   },
//   error: {
//     color: 'red',
//     marginBottom: 5
//   },
//   button: {
//     backgroundColor: '#4A90E2',
//     padding: 12,
//     borderRadius: 8,
//     alignItems: 'center'
//   },
//   buttonText: {
//     color: '#FFF',
//     fontWeight: 'bold'
//   },
//   card: {
//     backgroundColor: '#FFF',
//     padding: 15,
//     borderRadius: 10,
//     marginBottom: 15,
//     elevation: 2
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 5
//   },
//   cardText: {
//     color: '#555'
//   },
//   price: {
//     marginTop: 5,
//     fontWeight: 'bold',
//     color: '#2E7D32'
//   },
//   actions: {
//     flexDirection: 'row',
//     marginTop: 10
//   },
//   actionBtn: {
//     padding: 8,
//     borderRadius: 6,
//     marginRight: 10
//   },
//   editBtn: {
//     backgroundColor: '#FFA726'
//   },
//   deleteBtn: {
//     backgroundColor: '#EF5350'
//   },
//   actionText: {
//     color: '#FFF',
//     fontWeight: 'bold'
//   }
// });
}
