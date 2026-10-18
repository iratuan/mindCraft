package app.mindcraft.estudos;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(SaveFilePlugin.class);   // "Salvar como" com escolha de nome e pasta (seletor de documentos do sistema)
        super.onCreate(savedInstanceState);
    }
}
